import React, { useState } from "react";
import ModalWrapper from "../ModalWrapper";
import { Dialog, Listbox } from "@headlessui/react";
import Textbox from "../Textbox";
import { useForm } from "react-hook-form";
import UserList from "./UserList";
import SelectList from "../SelectList";
import { BiImages } from "react-icons/bi";
import Button from "../Button";

import { getStorage, ref, getDownloadURL, uploadBytesResumable } from "firebase/storage";
import { app } from "../../utils/firebase";
import { useCreateTaskMutation, useUpdateTaskMutation } from "../../redux/slices/api/taskApiSlice";
import { toast } from "sonner";
import { dateFormatter } from "../../utils";
import ProjectList from "./ProjectList"


const LISTS = ["TODO", "IN PROGRESS", "COMPLETED"];
const PRIORIRY = ["HIGH", "MEDIUM", "NORMAL", "LOW"];
const TYPES = ["DESIGN", "DOCUMENT", "FRONT-END", "BACK-END", "DATABASE", "TEST", "FIX"];

const uploadedFileURLs = [];

const AddTask = ({ open, setOpen, task }) => {

  const defaultValues = {
    title: task?.title || "",
    date: dateFormatter(task?.date || new Date()),
    endDate: dateFormatter(task?.endDate || new Date()),
    team: [],
    projectId: task?.projectId || {},
    stage: "",
    priority: "",
    typeIssue: "",
    assets: [],
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues });
  const [team, setTeam] = useState(task?.team || []);
  const [projectId, setProjectId] = useState(task?.projectId);
  const [stage, setStage] = useState(task?.stage?.toUpperCase() || LISTS[0]);
  const [typeIssue, setTypeIssue] = useState(task?.typeIssue?.toUpperCase() || TYPES[0]);
  const [priority, setPriority] = useState(
    task?.priority?.toUpperCase() || PRIORIRY[2]
  );
  const [assets, setAssets] = useState([]);
  const [uploading, setUploading] = useState(false);

  const [createTask, { isLoading }] = useCreateTaskMutation()
  const [updateTask, { isLoading: isUpdating }] = useUpdateTaskMutation()

  const URLS = task?.assets ? [...task.assets] : []


  const submitHandler = async (data) => {
    for (const file of assets) {
      setUploading(true)
      try {
        await upLoadFile(file)
      } catch (error) {
        console.error("Lỗi update file", error.message)
        return
      } finally {
        setUploading(false)
      }
    }

    try {
      const newData = {
        ...data,
        projectId,
        assets: [...URLS, ...uploadedFileURLs],
        team,
        stage,
        priority,
        typeIssue,
      }

      const res = task?._id
        ? await updateTask({ ...newData, _id: task._id }).unwrap()
        : await createTask(newData).unwrap()
      toast.success(res.message)

      setTimeout(() => {
        setOpen(false)
      }, 500)

    } catch (err) {
      console.log(err)
      toast.error(err?.data?.message || err.message)
    }
  };

  const handleSelect = (e) => {
    setAssets(e.target.files);
  };

  const upLoadFile = async (file) => {
    const storage = getStorage(app)
    const name = new Date().getTime() + file.name
    const storageRef = ref(storage, name)
    const upLoadTask = uploadBytesResumable(storageRef, file)

    return new Promise((resolve, reject) => {
      upLoadTask.on(
        "state_changed",
        (snapshot) => {
          console.log("Đang tải")
        },
        (error) => {
          reject(error);
        },
        () => {
          getDownloadURL(upLoadTask.snapshot.ref)
            .then((downLoadURL) => {
              uploadedFileURLs.push(downLoadURL);
              resolve()
            })
            .catch((error) => {
              reject(error);
            });
        }
      )
    })
  }

  return (
    <>
      <ModalWrapper open={open} setOpen={setOpen}>
        <form onSubmit={handleSubmit(submitHandler)}>
          <Dialog.Title
            as='h2'
            className='text-base font-bold leading-6 text-gray-900 mb-4'
          >
            {task ? "UPDATE TASK" : "ADD TASK"}
          </Dialog.Title>

          <div className='mt-2 flex flex-col gap-6'>
            <Textbox
              placeholder='Task Title'
              type='text'
              name='title'
              label='Task Title'
              className='w-full rounded'
              register={register("title", { required: "Title is required" })}
              error={errors.title ? errors.title.message : ""}
            />

            <SelectList
              label='Task Type'
              lists={TYPES}
              selected={typeIssue}
              setSelected={setTypeIssue}
            />

            <ProjectList setProjectId={setProjectId} projectId={projectId} />

            <UserList setTeam={setTeam} team={team} />

            <SelectList
              label='Task Stage'
              lists={LISTS}
              selected={stage}
              setSelected={setStage}
            />

            <div className='flex gap-4'>
              <div className='w-full'>
                <Textbox
                  placeholder='Date'
                  type='date'
                  name='date'
                  label='Task Date'
                  className='w-full rounded'
                  register={register("date", {
                    required: "Date is required!",
                  })}
                  error={errors.date ? errors.date.message : ""}
                />
              </div>

              <div className='w-full'>
                <Textbox
                  placeholder='Date'
                  type='date'
                  name='endDate'
                  label='End Date'
                  className='w-full rounded'
                  register={register("endDate", {
                    required: "End date is required!",
                  })}
                  error={errors.endDate ? errors.endDate.message : ""}
                />
              </div>
            </div>

            <div className='flex gap-4'>
              <SelectList
                label='Priority Level'
                lists={PRIORIRY}
                selected={priority}
                setSelected={setPriority}
              />

              <div className='w-full flex items-center justify-center mt-4'>
                <label
                  className='flex items-center gap-1 text-base text-ascent-2 hover:text-ascent-1 cursor-pointer my-4'
                  htmlFor='imgUpload'
                >
                  <input
                    type='file'
                    className='hidden'
                    id='imgUpload'
                    onChange={(e) => handleSelect(e)}
                    accept='.jpg, .png, .jpeg'
                    multiple={true}
                  />
                  <BiImages />
                  <span>Add Assets</span>
                </label>
              </div>
            </div>

            <div className='bg-gray-50 py-6 sm:flex sm:flex-row-reverse gap-4'>
              {uploading ? (
                <span className='text-sm py-2 text-red-500'>
                  Uploading assets
                </span>
              ) : (
                <Button
                  label='Submit'
                  type='submit'
                  className='bg-blue-600 px-8 text-sm font-semibold text-white hover:bg-blue-700  sm:w-auto'
                />
              )}

              <Button
                type='button'
                className='bg-white px-5 text-sm font-semibold text-gray-900 sm:w-auto'
                onClick={() => setOpen(false)}
                label='Cancel'
              />
            </div>
          </div>
        </form>
      </ModalWrapper>
    </>
  );
};

export default AddTask;
