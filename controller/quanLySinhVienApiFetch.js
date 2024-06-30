import { SinhVien } from "../models/SinhVien.js";

// Logic xử lý: Thao tác với dữ liệu và quản lý luồng dữ liệu
async function isExistSinhVien(maSinhVien) {
    try {
        const response = await fetch(`https://svcy.myclass.vn/api/SinhVienApi/LayThongTinSinhVien?maSinhVien=${maSinhVien}` , {
            method: 'GET'
        });
        // console.log(response);
        if (!response.ok) {
            if (response.status === 404) {
                // console.error('Student not found with ID:', maSinhVien);
                return false; // Trả về false nếu không tìm thấy sinh viên
            }
            // throw new Error('Server responded with error status ' + response.status);
            throw new Error('Failed to fetch student information');
        }
        const data = await response.json();
        return data !== null; // Trả về true nếu sinh viên có tồn tại, ngược lại false
    } catch (error) {
        // console.log('Error checking student existence:', error);
        // return false; // Trả về false nếu có lỗi xảy ra
        console.error('Error checking student existence:', error);
        throw error; // Ném lại lỗi để bên ngoài xử lý
    }
}

// Hàm lấy danh sách sinh viên từ server và render lên giao diện
async function getAllSinhVienAsync() {
    try {
        const response = await fetch(`https://svcy.myclass.vn/api/SinhVienApi/LayDanhSachSinhVien`);
        if (!response.ok) {
            throw new Error('Failed to fetch student list');
        }
        const data = await response.json();
        renderTableSinhVien(data);
    }
    catch (error) {
        // console.error('Error fetching data:', error);
        console.error('Error fetching student list:', error);
        // Hiển thị thông báo lỗi cho người dùng
        displayErrorMessage('Failed to fetch student list. Please try again.');
    }
}

// Hàm thêm mới sinh viên lên server và cập nhật lại danh sách sau khi thêm
async function insertSinhVienAsync(sinhVienOb) {
    try {
        const response = await fetch(`https://svcy.myclass.vn/api/SinhVienApi/ThemSinhVien`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(sinhVienOb),
        });
        if (!response.ok) {
            throw new Error('Failed to add student');
        }
        const data = await response.json();
        getAllSinhVienAsync(); // Sau khi thêm thành công, cập nhật lại danh sách
    }
    catch (error) {
        console.log('Error adding student:', error);
        alert('Failed to add student. Please try again.');
    }
}

// Hàm cập nhật thông tin sinh viên và sau đó cập nhật lại danh sách
async function updateSinhVienAsync(id, obUpdate) {
    try {
        const response = await fetch(`https://svcy.myclass.vn/api/SinhVienApi/CapNhatThongTinSinhVien?maSinhVien=${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(obUpdate),
        });
        if (!response.ok) {
            throw new Error('Failed to update student');
        }
        const data = await response.json();
        getAllSinhVienAsync(); // Sau khi cập nhật thành công, cập nhật lại danh sách
    }
    catch (error) {
        console.log('Error updating student:', error);
        alert('Failed to update student. Please try again.');
    }
}

// Hàm xóa sinh viên khỏi server và sau đó cập nhật lại danh sách
async function deleteSinhVienAsync(id) {
    try {
        const response = await fetch(`https://svcy.myclass.vn/api/SinhVienApi/XoaSinhVien?maSinhVien=${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            throw new Error('Failed to delete student');
        }
        const data = await response.json();
        getAllSinhVienAsync(); // Sau khi xóa thành công, cập nhật lại danh sách
    }
    catch (error) {
        console.log('Error deleting student:', error);
        alert('Failed to delete student. Please try again.');
    }
}

// Hàm render danh sách sinh viên lên giao diện
function renderTableSinhVien(arrSV) {
    let htmlString = '';
    for (let sv of arrSV) {
        htmlString += `
            <tr>
                <td>${sv.maSinhVien}</td>
                <td>${sv.tenSinhVien}</td>
                <td>${sv.soDienThoai}</td>
                <td>${sv.email}</td>
                <td>${sv.diemToan}</td>
                <td>${sv.diemLy}</td>
                <td>${sv.diemHoa}</td>
                <td>${sv.diemRenLuyen}</td>
                <td>${sv.loaiSinhVien}</td>
                <td>
                    <button class="btn btn-primary mx-2" onclick="chinhSua('${sv.maSinhVien}')">Chỉnh sửa</button>
                    <button class="btn btn-danger" onclick="xoaSinhVien('${sv.maSinhVien}')">Xoá</button>
                </td>
            </tr>
        `;
    }
    // Hiển thị danh sách sinh viên lên table
    document.querySelector('tbody').innerHTML = htmlString;
}

// Sự kiện submit form để thêm hoặc cập nhật sinh viên
document.querySelector('#frmSinhVien').onsubmit = async function (e) {
    e.preventDefault();

    // Lấy dữ liệu người dùng nhập từ form
    let sv = new SinhVien();
    let arrInput = document.querySelectorAll('#frmSinhVien .form-control');
    for (let input of arrInput) {
        sv[input.id] = input.value;
    }

    // Kiểm tra xem sinh viên đã tồn tại hay chưa
    const exists = await isExistSinhVien(sv.maSinhVien);

    // Nếu tồn tại sinh viên, thông báo lỗi và không cho phép thực hiện thêm/cập nhật
    if (exists) {
        alert('Student ID already exists. Please choose a different ID.');
        return;
    }

    try {
        // Thực hiện thêm mới hoặc cập nhật dựa vào sự tồn tại của sinh viên
        if (exists) {
            await updateSinhVienAsync(sv.maSinhVien, sv); // Cập nhật nếu đã tồn tại sinh viên có mã này
        } else {
            await insertSinhVienAsync(sv); // Thêm mới nếu chưa tồn tại sinh viên có mã này
        }

        // Đặt lại form sau khi thêm hoặc cập nhật thành công
        this.reset();

        // Sau khi cập nhật thành công, load lại danh sách sinh viên
        getAllSinhVienAsync();
    } catch (error) {
        console.error('Error adding/updating student:', error);
        alert('Failed to add/update student. Please try again.');
    }
}

// Truy cập dữ liệu: Gửi các request lên server để lấy và cập nhật dữ liệu
window.xoaSinhVien = async function (maSinhVien) {
    if (confirm('Bạn có chắc muốn xóa sinh viên này?')) {
        try {
            await deleteSinhVienAsync(maSinhVien);
        } catch (error) {
            console.error('Error deleting student:', error);
            alert('Failed to delete student. Please try again.');
        }
    }
}

// Hàm chỉnh sửa sinh viên
window.chinhSua = async function (maSinhVien) {
    try {
        const response = await fetch(`https://svcy.myclass.vn/api/SinhVienApi/LayThongTinSinhVien?maSinhVien=${maSinhVien}`);
        if (!response.ok) {
            throw new Error('Failed to retrieve student information');
        }
        const sv = await response.json();
        if (sv) {
            // Đổ dữ liệu của sinh viên lên form để chỉnh sửa
            let arrInput = document.querySelectorAll('#frmSinhVien .form-control');
            for (let input of arrInput) {
                input.value = sv[input.id] || '';
            }
        } else {
            console.error('Student not found');
            alert('Student not found.');
        }
    } catch (error) {
        console.error('Error retrieving student information:', error);
        alert('Failed to retrieve student information. Please try again.');
    }
}

// Sự kiện click nút lưu thông tin sinh viên
document.querySelector('#btnLuuThongTin').onclick = async function (e) {
    e.preventDefault();
    // Lấy dữ liệu người dùng nhập từ form
    let sv = new SinhVien();
    let arrInput = document.querySelectorAll('#frmSinhVien .form-control');
    for (let input of arrInput) {
        sv[input.id] = input.value;
    }

    // Kiểm tra xem có cần thêm hay cập nhật dựa trên điều kiện tồn tại mã sinh viên hay không
    if (!sv.maSinhVien) {
        console.error('Missing student ID'); // Báo lỗi nếu thiếu mã sinh viên
        alert('Missing student ID. Please enter student ID.');
        return;
    }

    // Thực hiện thêm mới hoặc cập nhật dựa vào sự tồn tại của sinh viên
    if (await isExistSinhVien(sv.maSinhVien)) {
        await updateSinhVienAsync(sv.maSinhVien, sv); // Cập nhật nếu đã tồn tại sinh viên có mã này
    } else {
        await insertSinhVienAsync(sv); // Thêm mới nếu chưa tồn tại sinh viên có mã này
    }

    // Đặt lại form sau khi thêm hoặc cập nhật thành công
    document.querySelector('#frmSinhVien').reset();

    // Sau khi cập nhật thành công, load lại danh sách sinh viên
    getAllSinhVienAsync();
}

// Hàm setInterval là hàm sẽ chạy liên tục sau mỗi thời gian qui định
setInterval(function () {
    getAllSinhVienAsync();
}, 5000); // 5000 là 5000 mili giây hàm function sẽ chạy 1 lần

window.onload = function (e) {
    // Khi window load tất cả xong thì sẽ chạy hàm này
    getAllSinhVienAsync();
}
