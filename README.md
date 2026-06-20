# PT Galaxy Multi Trans — Sistem Invoice & Pengiriman

## 📁 Struktur Proyek

```
galaxy-trans/
├── backend/
│   ├── main.py              ← FastAPI app utama
│   ├── database.py          ← Database JSON (file-based)
│   ├── models.py            ← Pydantic models
│   ├── requirements.txt
│   ├── data/                ← Folder data JSON (auto-dibuat)
│   └── routers/
│       ├── auth.py          ← Login & JWT
│       ├── customers.py
│       ├── destinations.py
│       ├── services.py
│       ├── shipments.py
│       ├── invoices.py
│       └── reports.py
└── frontend/
    ├── index.html           ← Halaman Login
    ├── css/style.css
    ├── js/api.js
    └── pages/
        ├── dashboard.html
        ├── shipments.html
        ├── invoices.html
        ├── customers.html
        ├── destinations.html
        ├── services.html
        ├── reports.html
        └── users.html
```

---

## 🚀 Cara Menjalankan

### 1. Backend (FastAPI)

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Jalankan server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

API berjalan di: http://localhost:8000
Dokumentasi API: http://localhost:8000/docs

### 2. Frontend

Gunakan live server (misalnya VS Code extension "Live Server"):
- Klik kanan `frontend/index.html` → Open with Live Server

**ATAU** jalankan Python HTTP server:
```bash
cd frontend
python -m http.server 3000
```

Akses di: http://localhost:3000

---

## 🔑 Akun Default

| Username   | Password     | Role      | Hak Akses                    |
|------------|-------------|-----------|------------------------------|
| admin      | admin123    | Admin     | Semua fitur                  |
| staff      | staff123    | Staff     | Pengiriman, lihat data       |
| keuangan   | keuangan123 | Keuangan  | Invoice, laporan keuangan    |

---

## ✨ Fitur Lengkap

### 🔐 Autentikasi
- Login multi-user dengan JWT token
- Role-based access (Admin, Staff, Keuangan)
- Session management

### 📊 Dashboard
- Statistik total pengiriman, invoice, pendapatan
- Status pengiriman real-time
- Notifikasi invoice belum bayar
- Tabel aktivitas terbaru

### 📦 Manajemen Pengiriman
- Input data pengirim & penerima
- **Kalkulasi biaya otomatis** berdasarkan tarif + surcharge zona
- **Generate nomor resi otomatis** (format: GMT{YYYYMMDD}{NNNN})
- Update status: Pending → Dikirim → Selesai
- Filter & pencarian data

### 🧾 Invoice Otomatis
- **Generate invoice dari data pengiriman**
- **Nomor invoice otomatis** (format: INV/YYYY-MM/NNNN)
- Tambah pajak % dan diskon nominal
- **Preview & Cetak invoice** (format printer-friendly)
- **Download PDF** (via html2canvas + jsPDF)
- Update status pembayaran: Belum Bayar → Lunas

### 👥 Data Master
- Pelanggan (nama, alamat, kontak, NPWP)
- Tujuan pengiriman (kota, provinsi, zona A/B/C, surcharge)
- Layanan (Reguler/Express/Cargo dengan harga per kg)

### 📊 Laporan
- Laporan pengiriman per periode
- Laporan invoice dengan filter status bayar
- Laporan pendapatan bulanan + grafik visual
- **Export ke Excel (.xlsx)** via SheetJS
- **Export ke PDF** via jsPDF AutoTable

### 🔑 Manajemen User (Admin only)
- Tambah user baru dengan role
- Hapus user
- Lihat daftar semua user

---

## 🗄️ Database

Sistem menggunakan database JSON berbasis file (tidak perlu instalasi database):
- Data tersimpan di `backend/data/*.json`
- Cocok untuk development dan skala kecil-menengah
- Untuk produksi: mudah migrate ke PostgreSQL/MySQL dengan mengganti `database.py`

### Data Awal (Seed)
Sistem otomatis membuat data awal:
- 3 user (admin, staff, keuangan)
- 3 layanan (Reguler, Express, Cargo)
- 10 kota tujuan
- 3 contoh pelanggan

---

## ⚙️ Konfigurasi

Edit `backend/database.py` untuk mengubah:
- Harga tarif awal
- Kota tujuan default
- Zona pengiriman

Edit `frontend/js/api.js` untuk mengubah:
- `API_BASE` — URL backend (default: http://localhost:8000/api)

---

## 🔧 Tech Stack

**Backend:**
- FastAPI (Python)
- JWT Authentication (PyJWT)
- JSON File Database
- Pydantic v2

**Frontend:**
- HTML5 + CSS3 + Vanilla JavaScript
- Font: Syne (display) + DM Sans (body)
- jsPDF + html2canvas (PDF generation)
- SheetJS/XLSX (Excel export)
- Tidak ada framework — pure vanilla JS
