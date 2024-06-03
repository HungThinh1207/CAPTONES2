1. Đầu tiên, trên máy phải có node sever, nếu chưa có thể download tại "https://nodejs.org/en/download/prebuilt-installer/current".
Sau đó chạy câu lệnh "node -v" và "npm -v" để kiểm tra version của node và npm.
2. Kiểm tra xem ở folder client và server đã có file "node_modules" chưa, nếu chưa thì chạy các câu lệnh sau để download node_modules, trỏ terminal từ folder CAPSTONE2 ta chạy câu lệnh:
+ cd client -> npm install
+ cd server -> npm install
3. Database của ứng dụng được lưu trên cloud Mongodb, đường dẫn đến data đã được cấp ở file .env của folder server. Nếu trường hợp đường dẫn không hoạt động được, hãy đăng nhập vào "https://www.mongodb.com/" và tạo một data mới rồi gắn đường dẫn vào biến "MONGODB_URI" ở file .env của folder server.
4. Sau khi đã hoàn thành các bước trên, ta chỉ cần chạy các câu lệnh sau để chạy website:
+ cd client -> npm run dev
+ cd server -> npm start
5. Tài khoản để đăng nhập với data cho sẵn là:
- adminThinh127@gmail.com
- 123456
Nếu khi chạy website thấy trắng màn hình, chỉ cần xóa Key "userInfo" ở Local storage rồi làm mới lại trang là có thể đăng nhập lại được.