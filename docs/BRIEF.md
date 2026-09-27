# Wake (Wallet Rotation Terminal)

PRD lengkap. Semua fitur di dokumen ini **wajib selesai**; tidak ada pembagian fase. Di section 15 ada urutan pengerjaan yang disarankan, hanya sebagai saran teknis untuk mengurangi risiko.

---

## 1. Ringkasan

Wake adalah terminal observasi untuk melihat **ke mana modal berpindah** di Robinhood Chain. Pola intinya: satu wallet menjual token A, lalu dalam jendela waktu tertentu membeli token B. Wake mengumpulkan pola itu dari log on-chain, mengurutkannya menjadi papan ranking, menggambarnya sebagai jaringan, dan memperlihatkan bukti transaksinya satu per satu.

Wake adalah **port penuh dari STAMPEDE (Python) ke TypeScript**, dengan nama dan identitas visual sendiri, ditambah fitur milik Wake: **Watchlist** personal. Aplikasi berjalan lokal di laptop pengguna (local-first), tanpa server pusat dan tanpa Python.

Prinsip yang tidak boleh dilanggar: **Wake hanya menyatakan apa yang teramati.** Bukan aliran uang, bukan kepemilikan bersama, bukan informasi orang dalam.

## 2. Izin, Atribusi, dan Aturan Repo

- Izin memakai dan memodifikasi STAMPEDE sudah diurus di sisi lead. Dev menyimpan bukti izin (screenshot atau pesan) di `docs/PERMISSION.md`.
- `README.md` mencantumkan: "Wake adalah port TypeScript dari STAMPEDE (github.com/Argona7/stampede), dipakai dengan izin pembuatnya."
- Nama produk, logo, maskot, palet, dan teks UI milik Wake sendiri. Aset visual STAMPEDE (gorila, brand, gambar) tidak dibawa.
- Repo **tidak boleh berisi file `.py`**. Semua berjalan dengan `npm install` dan `npm run start`.
- Perilaku STAMPEDE dibaca sebagai spesifikasi: `docs/ALGORITHM.md`, `ENGINE.md`, `RADAR.md`, `COVERAGE.md`, `RESEARCH-*.md`, dan folder `tests/`.

## 3. Target User

Trader token baru di Robinhood Chain yang mau melihat aliran modal secara jujur, memantau wallet tertentu, dan menelusuri bukti transaksi, tanpa mendaftar akun di layanan mana pun. Pengguna cukup teknis untuk `git clone` dan `npm install`.

## 4. Prinsip Produk

1. **Observasi, bukan saran.** Teks UI hanya menyatakan yang teramati ("wallet ini terlihat menjual A lalu membeli B dalam 7 menit"). Dilarang: "danai", "sinyal beli pasti", atau klaim sebab-akibat.
2. **Kejujuran cakupan.** Panel Data coverage selalu terlihat dan menyebut batas data (hanya kurva Pons V2 dan pool v4-nya).
3. **Sumber dan waktu ambil** wajib tampil pada setiap angka eksternal.
4. **Mode selalu berlabel.** Sample, Replay, dan Live dibedakan jelas di setiap layar.
5. **Jarak node di peta hanyalah tata letak**, bukan fakta analitis. Legenda "How to read" wajib menyatakan ini.
6. **Local-first.** Data pengguna (watchlist, dsb) hanya di komputernya.

## 5. Tech Stack dan Struktur

| Area | Pilihan |
|---|---|
| Runtime | Node.js 22+, TypeScript penuh |
| Klien chain | `viem`, Multicall3, `@envio-dev/hypersync-client` (token gratis) dengan fallback RPC publik |
| API lokal | Fastify atau Hono, validasi `zod`, SSE untuk stream |
| Penyimpanan | `node:sqlite` atau `better-sqlite3` (data indeks) dan file JSON (watchlist) |
| Frontend | Vite + React + TypeScript, `three.js` + `d3-force-3d` (3D), `d3-force` (2D), canvas untuk tape dan sparkline |
| Test | `vitest`, `playwright` untuk uji UI |
| TUI | Ink (opsional tapi termasuk dalam lingkup, section 8.11) |

```
wake/
  packages/
    core/     rpc, chain, ingest, normalize, rotation, coverage
    store/    sqlite, migrasi
    engine/   bus, feed, runner, state, seed  (mode sample, replay, live)
    api/      server, queries, radar, stream, session, traders, alerts
    signals/  risk, verdict, sizing (config JSON)
    context/  market, holders, pons, fx, launch-intel, xmentions
    research/ backfill, backtest, edge, features, traders
    calls/    format, poster
    cli/      wake (demo, serve, terminal, backfill, launch-intel, wallet-scores, edge)
  web/        antarmuka
  docs/       PERMISSION.md, PARITY.md
  test/       fixture dan test paritas
```

## 6. Mode Operasi

| Mode | Sumber data | Catatan |
|---|---|---|
| **Sample** | File sampel yang direkam sendiri (60 menit Pons V2) | Tanpa jaringan dan tanpa API key. Banner "SAMPLE DATA, bukan pasar saat ini". Dijalankan dengan `wake demo`. |
| **Replay** | Store lokal hasil rekam/backfill | Jam sesi bersama, kecepatan 1x/10x/20x/60x, pause dan seek. |
| **Live** | RPC/Hypersync real-time | Konteks eksternal (pasar, holder, X) aktif. Backfill 60 menit saat start dengan progress terlihat. |

Semua layar membaca **satu jam sesi bersama** (shared session clock), sehingga semua tampilan konsisten pada waktu yang sama.

## 7. Definisi Domain

- **Trade**: satu `CurveBuy`/`CurveSell` (kurva) atau `Swap` v4 (pool graduasi), dinormalisasi ke kuantitas token, jumlah quote, harga, waktu, alamat.
- **Rotation**: dari alamat yang sama, jual token A pada `t1` lalu beli token B pada `t2` dengan `A != B` dan `0 < t2 - t1 <= W` (**match window**, pilihan 5 menit, 15 menit, 30 menit, 1 jam; default 30 menit).
- **Grade**: rotasi **clean/direct** (pasangan tegas) versus **unclear** (ambigu, misal beberapa kemungkinan pasangan atau satu transaksi). Unclear tidak dihitung, hanya bisa ditampilkan lewat "Show unclear links".
- **Link**: agregasi rotasi A ke B = jumlah wallet unik yang melakukannya dalam rentang.
- Alamat kontrak (router, aggregator) tidak dianggap pelaku. Untuk token graduasi, `sender` pada Swap v4 bisa berupa router, jadi wallet pada pool v4 diberi `confidence: low`.
- **Batas nilai**: trade di bawah ambang debu diabaikan (dikonfigurasi di `config/rotation.ts`).
- Detil algoritma pemasangan dan aturan tie-break mengikuti `docs/ALGORITHM.md`; setiap penyimpangan dicatat di `docs/PARITY.md`.

## 8. Fitur

### 8.1 Latest rotations dan Live tape
- **Latest rotations**: strip bawah berisi waktu, wallet, jual ke beli, dan jeda. Baris merah = baru sejak polling terakhir.
- **Live tape**: aliran baris rotasi bergulir (canvas). Saat pertama memuat riwayat, seluruh rentang terlihat "mengalir" cepat dengan penghitung "STREAMING n / total".

### 8.2 Inflow (papan ranking)
Ranking token menurut inflow rotasi yang teramati.

**Skor 0-100**, semua komponen tampil di samping total:
| Komponen | Maks | Arti |
|---|---|---|
| Inflow | 40 | Wallet unik rotasi masuk dalam 10 menit terakhir (skala log, 150 wallet = 40) |
| Acceleration | 25 | Rasio 10 menit terakhir terhadap rata-rata 10 menit pada 20 menit sebelumnya |
| Breadth | 15 | Jumlah token asal berbeda dalam 10 menit terakhir |
| Wallet quality | 20 | Rata-rata kualitas historis wallet yang masuk (dari `wallet_scores`, 10 bila tidak diketahui) |
| Age bonus | +12 / +6 | Token < 30 menit / < 2 jam |
| Curve bonus | +6 | Masih di bonding curve |
| Attention penalty | sampai -60 | Sebutan cashtag/kontrak di X dalam 1 jam (0 bila tidak diambil) |

Skor dihitung ulang tiap permintaan dari data terindeks pada jam sesi.

**Preset:**
| Nama | Aturan |
|---|---|
| **Early** | Di curve, umur < 4 jam, sebutan X <= 3 atau tidak diketahui, bot disembunyikan |
| **Near graduation** | Progres curve >= 60% ambang graduasi, diurut progres |
| **Proven wallets** | Rata-rata kualitas wallet masuk >= 0.55, bot disembunyikan |
| **Fair launch** | Dev beli <= 5% suplai, maksimal 2 wallet bundel bebas pajak, bukan launch farm; token tanpa data launch tidak lolos |
| **All** | Semua token yang punya inflow pada rentang tampil |

**Filter:** minimum wallet, umur, stage (curve/graduated), batas sebutan X, sembunyikan bot. **Sort:** skor, inflow, acceleration, progres graduasi. Ticker kembar dibedakan dengan akhiran alamat (`MARIO·43cb`).

**Alert log:** aturan `under_radar_top5` (masuk top 5, skor >= 60, inflow >= 8, sebutan X <= 3 atau tidak diketahui), satu alert per token per 30 menit jam sesi. Hasil (harga median 5 trade terakhir dan status graduasi) diisi 30 dan 60 menit kemudian. Ada rekap track record.

### 8.3 Coin Flow
Halaman per token: dari token mana wallet datang (inflow) dan ke mana pergi (outflow), diagram ego-network, daftar link masuk/keluar, jumlah pembeli dan penjual, pembeli pertama kali versus berulang, dan statistik ringkas. Laci detail token memuat konteks (8.2) dan bagian Launch.

### 8.4 Network (peta)
- Kanvas **3D** (`three.js`, layout `d3-force-3d`) dengan fallback **2D**; drag untuk orbit, scroll untuk zoom, klik token atau link.
- Layout inkremental: node lama mempertahankan posisi, node baru muncul dekat tetangganya; token berlapis kedalaman menurut kekuatan link.
- Ukuran node mengikuti aktivitas; ketebalan garis mengikuti jumlah wallet; garis putus-putus = unclear.
- Denyut amber pada link yang baru menerima rotasi; kamera fokus pada pasangan yang dipilih dan sisanya meredup.
- **Panel kiri:** Match window, Time range (5m/15m/30m/1h + slider), Min wallets per link, Top links (25/50/100/300), Show unclear links, **Range summary** (drawn/matching, coins, rotation rows, distinct wallets), **Data coverage** (sample trades, whole store trades, unknown-time trades, pool v4 tidak tercakup, ketepatan timestamp).
- **How to read**: "Line A to B: distinct wallets that sold A, then bought B within the window. Width = wallets. Dashed = unclear only. Distance is layout, not a fact."
- **Proof rows** (panel kanan): pilih link A ke B untuk melihat wallet, jual dan beli (jumlah token, nilai, DEX, waktu UTC perkiraan, nomor blok, tx hash ke Blockscout), jeda, dan label clean/unclear. Ringkasan: wallet berbeda, satu tx, clean, unclear-tidak-dihitung.
- **Details panel**: kosong berisi petunjuk; token terpilih menampilkan pembeli, penjual, dan link masuk/keluar.
- **Guided tour** (autopilot): kamera otomatis menyorot pasangan terkuat lalu membuka Proof rows; dapat dihentikan dan dilanjutkan.
- **Showcase mode** (`P`): tata letak presentasi tanpa panel kontrol.

### 8.5 Wallets
Kartu profil wallet (dari `WalletCard` dan `traders`): riwayat trade, token yang dipegang/ditinggalkan, rotasi yang dilakukan, skor kualitas historis, dan pencarian banyak wallet sekaligus (lookup). Daftar trader diurut menurut skor kualitas walk-forward.

### 8.6 Risk (sinyal dan verdict)
- **Risk engine**: sinyal risiko per token dari data terindeks (konfigurasi `risk-config`), dengan ukuran posisi berbasis fractional Kelly di bawah batas keras, penyesuaian volatilitas, dan batas rugi harian.
- **Verdict** ENTER / WAIT / AVOID per token, memuat: p(naik >= 2x dalam 30 menit), p(-50%), EV per trade, rencana keluar (tangga TP, trailing, stop, keluar berdasar waktu, pemicu keluar-segera), dan ukuran posisi. p berasal dari model walk-forward bila tersedia, jika tidak dari sel aturan terkalibrasi (`edge-config`). Ditampilkan sebagai kolom di Inflow dan bagian di laci token.
- Aturan alert `edge_enter`: verdict ENTER dengan p di atas ambang, EV > 0, dan ukuran diizinkan; maksimal 5 per jam sesi, satu per token per 30 menit.
- **Wajib:** setiap tampilan verdict memuat disclaimer tetap: "Bukan saran keuangan. Probabilitas berasal dari model historis, bukan jaminan. Hasil 'runner' adalah jalur harga di kurva tanpa biaya."
- **Catatan implementasi:** model `scikit-learn` diganti dengan model TypeScript (regresi logistik atau gradient boosting via pustaka JS) yang dilatih oleh CLI `wake edge`, dengan kalibrasi dan keluaran yang dibandingkan terhadap hasil STAMPEDE di `docs/PARITY.md`. Bila model belum dilatih, sel aturan `edge-config` dipakai.

### 8.7 Watchlist (fitur milik Wake)
- Pengguna menambah hingga 20 alamat wallet dengan label (`~/.wake/watchlist.json`).
- **Watchlist Status** per alamat: `rotated` (ada rotasi dalam rentang), `active_no_rotation`, `idle`, atau `unknown`.
- Rotasi baru dari alamat watchlist muncul dengan penanda "baru sejak terakhir dilihat" (`~/.wake/seen.json`); penanda hilang setelah dilihat.
- Ekspor dan impor watchlist (JSON).
- Klik alamat membuka kartu Wallets (8.5).

### 8.8 Replay, Sample, dan kontrol waktu
- **Bilah atas:** badge mode (`PAUSED · REPLAY 20x`), tombol Play/Pause, kecepatan 1x/10x/20x/60x, Session clock, Time range, Match window, "Showing n of m links", Back 5m, Forward 5m, Jump to start, Search token, Back to overview (`Esc`), pilih 3D/2D, Showcase mode.
- **Pintasan keyboard:** spasi play/pause, panah kiri/kanan seek, `[` dan `]` kecepatan, `P` showcase, `Esc` kembali.
- **Sample session:** sampel rekaman sendiri (bukan bundel STAMPEDE), dimuat dengan satu tombol "Load sample".

### 8.9 Data coverage
Panel jujur berisi: jumlah trade sampel dan total, trade tanpa waktu pasti, pool v4 yang tidak tercakup, keterangan bahwa waktu blok bersifat interpolasi ("approx."), dan cakupan DEX (hanya kurva Pons V2 dan pool v4 hasil graduasinya).

### 8.10 Konteks eksternal (mode Live)
| Modul | Sumber | Cache |
|---|---|---|
| Siklus hidup token | Log `TokenLaunched`, `CurveCompleted`, `PoolRegistered` | tabel `launches`, `graduations` |
| Progres curve | Net quote masuk dibanding ambang graduasi | dihitung |
| Sosial yang dideklarasikan | Teks di calldata transaksi peluncuran | 7 hari |
| Pasar sekarang | GeckoTerminal (harga, FDV, likuiditas, volume) | 60 detik |
| Holder dan dev | Riwayat Transfer ERC-20 via RPC publik (top-10 share, dev holding, pembeli blok peluncuran) | 5-10 menit |
| Sebutan X | twitterapi.io (opsional, butuh API key) | 5 menit |
| Wallet scores | Diimpor dari `wake wallet-scores` | sampai diimpor ulang |
| Launch quality | `wake launch-intel` (dev buy share, bundel bebas pajak, creator tax, rekam deployer 30 hari, flag launch farm, waktu snipe-tax nol) | sampai dihitung ulang |

Setiap angka eksternal menampilkan sumber dan waktu ambil. Anggaran panggilan harian dihitung di tabel `api_budget` dan tampil di `/api/radar`. Mode Sample/Replay hanya memakai angka on-chain sesuai jam sesi.

### 8.11 Console (TUI)
Tampilan terminal (Ink): feed rotasi pada jam replay, layar Inflow, kartu token satu baris (termasuk verdict). Dijalankan lewat `wake terminal`. Kontrol sama dengan web: spasi, panah, `[` `]`, `q`.

### 8.12 Calls, Paper log, dan Track record
- **Calls:** modul opsional yang memformat alert menjadi pesan dan mengirimnya ke kanal Telegram. **Mati secara default**; aktif hanya bila token bot dan chat ID diisi di `.env`.
- **Paper log:** pencatatan trade simulasi berdasarkan verdict (tanpa uang, tanpa koneksi ke exchange), dengan tabel posisi terbuka dan tertutup.
- **Track record:** rekap hasil alert (30 dan 60 menit) dan statistik performa (`/api/track-record`, `/api/perf`).

### 8.13 Research toolkit (CLI)
Perintah `wake backfill` (isi store dari rentang historis, via Hypersync atau RPC), `wake launch-intel`, `wake wallet-scores`, `wake edge` (latih dan kalibrasi verdict), dan `wake backtest` (uji walk-forward). Keluaran dipakai oleh Inflow dan Risk.

## 9. Penyimpanan Data

- **Store terindeks** (`node:sqlite`): trade, peluncuran, graduasi, rotasi, launch intel, wallet scores, alert dan hasilnya, anggaran API, snapshot cache konteks. Skema boleh berbeda dari STAMPEDE, tetapi data yang disimpan setara.
- **File pengguna** di `~/.wake/`: `watchlist.json`, `seen.json`, `settings.json`.
- Lokasi database dapat diganti lewat `WAKE_DB`.

## 10. API Lokal

Hanya `localhost`, tanpa auth. Bentuk JSON dijaga setara STAMPEDE agar port frontend mudah.

| Method | Path | Fungsi |
|---|---|---|
| GET | `/api/status` | Mode, jam sesi, rentang sampel, anggaran API |
| GET | `/api/graph` | Node dan link untuk peta (window, from, to, min_wallets, limit) |
| GET | `/api/edge/:a/:b` | Bukti rotasi A ke B |
| GET | `/api/token/:addr` | Ringkasan token dalam rentang |
| GET | `/api/search` | Cari token |
| GET | `/api/radar` | Papan Inflow (preset, filter, sort) |
| GET | `/api/coin/:addr` | Laci detail token dan konteks (`refresh` opsional) |
| GET | `/api/alerts` | Jurnal alert |
| GET | `/api/paper` | Paper log |
| GET | `/api/track-record` | Rekap hasil alert |
| GET | `/api/perf` | Statistik performa |
| GET | `/api/traders` | Daftar trader |
| GET | `/api/wallet/:addr` | Kartu wallet |
| GET | `/api/traders/lookup` | Lookup banyak wallet |
| GET | `/api/stream` | SSE rotasi baru |
| POST | `/api/session/control` | play, pause, speed, seek |
| GET/POST/DELETE | `/api/watchlist` | Kelola watchlist |
| GET | `/api/watchlist/status` | Watchlist Status |

## 11. Peta Port Python ke TypeScript

| Modul Python (STAMPEDE) | Padanan Wake |
|---|---|
| `chain.py`, `rpc.py` | `core/chain`, `core/rpc` (antrian request dengan jalur prioritas dan jeda) |
| `hypersync.py`, `ingest.py` | `core/ingest` (`@envio-dev/hypersync-client`, fallback RPC) |
| `normalize.py` | `core/normalize` |
| `rotation.py` | `core/rotation` (fungsi murni) |
| `store.py` | `store/sqlite` |
| `engine/*` | `engine/*` |
| `api/*` | `api/*` |
| `signals/*` | `signals/*` (JSON config dipindah apa adanya) |
| `context/*` | `context/*` |
| `research/*` | `research/*` (model diganti pustaka JS) |
| `calls/*`, `paper*`, `track_record.py` | `calls/*`, `api/paper`, `api/track-record` |
| `demo.py`, `coverage.py`, `probe.py` | `cli/demo`, `core/coverage` |
| `tui/*` (Textual) | `cli/terminal` (Ink) |
| `web/src/*` | `web/src/*` |

Ekivalen pustaka: FastAPI ke Fastify/Hono, Pydantic ke zod, sqlite3 ke node:sqlite, asyncio ke async/await, pytest ke vitest.

## 12. Non-Fungsional

- **Rate limit RPC publik:** semua request lewat antrian dengan dua jalur (yang tampil di layar diutamakan, scan riwayat di latar belakang lebih lambat), jeda antar request, dan backoff saat 429. Query log berindeks jangan dipecah per rentang blok terlalu kecil.
- **Performa:** menggeser jam replay atau ganti rentang tidak memblokir UI; peta 300 link tetap lancar.
- **Aksesibilitas:** kontrol dapat dijangkau keyboard, kontras memenuhi WCAG AA, dan `prefers-reduced-motion` menonaktifkan denyut/animasi.
- **Responsif:** desktop utama; tablet tetap dapat dipakai; mode 2D untuk perangkat tanpa WebGL.
- **Keamanan:** hanya baca data publik, tidak ada kunci privat, API key hanya di `.env` lokal (tidak pernah dikirim ke UI), server hanya bind ke `127.0.0.1`.
- **Ikon:** SVG, bukan emoji.

## 13. Penamaan

Tab: **Inflow** (Radar), **Coin Flow** (Flow), **Network** (Map), **Wallets** (Traders), **Risk** (Signals), **Console** (Terminal), **Watchlist** (baru). Istilah: sequence menjadi **rotation**, edge/flow menjadi **link**, ambiguous menjadi **unclear**, pairing window menjadi **match window**, visible range menjadi **time range**, autopilot menjadi **guided tour**, present menjadi **showcase mode**, tape menjadi **live tape**, sequences at the clock menjadi **latest rotations**.

## 14. Konfigurasi (`.env`)

| Variabel | Fungsi |
|---|---|
| `ROBINHOOD_RPC_URL` | RPC (default publik) |
| `HYPERSYNC_TOKEN` | Token Envio (opsional, tanpa ini jatuh ke RPC lebih lambat) |
| `TWITTERAPI_KEY` | Sebutan X (opsional) |
| `WAKE_DB` | Lokasi store |
| `WAKE_CONTEXT` | `live` (default) atau `always` |
| `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` | Calls (opsional) |

## 15. Urutan Pengerjaan yang Disarankan (semua wajib selesai)

Bukan fase; hanya urutan agar dependensi tidak terbalik.
1. `core` (rpc, chain, ingest, normalize, rotation) beserta test paritas.
2. `store` dan `engine` (mode Sample dan Replay), lalu `api`.
3. Web: Latest rotations, Inflow, Coin Flow, Proof rows.
4. Network 2D lalu 3D, Guided tour, Showcase mode.
5. Konteks (`context/*`), Wallets, Risk dan verdict, Alert log, Track record.
6. Watchlist dan Watchlist Status.
7. Research toolkit (`backfill`, `launch-intel`, `wallet-scores`, `edge`, `backtest`), Calls, Paper log, Console.

## 16. Acceptance Test dan Definition of Done

| # | Test |
|---|---|
| 1 | `npm install && npm run start` jalan tanpa Python dan tanpa `uv`. Repo tidak berisi `.py`. |
| 2 | Setiap test STAMPEDE yang relevan (`test_rotation`, `test_normalize`, `test_radar`, `test_engine`, `test_edge`, `test_traders`, dan sejenisnya) punya padanan `vitest` dengan fixture sama dan keluaran sama. |
| 3 | Sampel yang sama menghasilkan jumlah trade, jumlah rotasi, dan pasangan token teratas yang sama (toleransi 0 untuk hitungan bulat). Selisih apa pun tertulis di `docs/PARITY.md`. |
| 4 | Mode Sample/Replay berjalan pada 1x, 10x, 20x, 60x dengan pause dan seek; semua layar mengikuti jam sesi yang sama. |
| 5 | Network tampil 2D dan 3D; satu link bisa dibuka sampai baris bukti dengan tx hash ke Blockscout. |
| 6 | Setiap elemen pada section 8 dan 13 ada di UI (checklist per elemen dicentang oleh reviewer). |
| 7 | Skor Inflow menampilkan semua komponen; preset dan filter menghasilkan hasil yang sama dengan STAMPEDE pada fixture yang sama. |
| 8 | Alert log mengisi hasil 30 dan 60 menit; Track record menghitung rekap dengan benar pada fixture. |
| 9 | Verdict selalu disertai disclaimer; tidak ada teks UI yang mengklaim sebab-akibat atau memerintahkan beli/jual. |
| 10 | Tambah alamat ke watchlist, restart: alamat masih ada; rotasi baru dari alamat itu tampil dengan penanda "baru" yang hilang setelah dilihat. |
| 11 | Backfill saat start menampilkan progress; tidak ada feed kosong tanpa penjelasan. |
| 12 | Calls tidak mengirim apa pun kecuali token dan chat ID diisi; tanpa key eksternal aplikasi tetap berjalan penuh pada data on-chain. |
| 13 | `docs/PERMISSION.md` dan atribusi README ada. |
| 14 | Demo 2 menit tanpa wallet pribadi: `npm run start`, Load sample, putar replay, buka satu link sampai bukti, tambah satu alamat ke watchlist. |
| 15 | Landing page (section 18) live, tidak memanggil backend apa pun, tidak punya tombol Connect Wallet atau Launch App, dan memuat callout "local software" di atas lipatan pertama. |

## 17. Risiko dan Catatan

- **Verdict adalah wilayah sensitif** (sinyal masuk beserta ukuran posisi). Disclaimer wajib, dan sebaiknya lead memberi keputusan tertulis bahwa fitur ini memang dirilis.
- **Model prediksi** harus dilatih ulang di TypeScript; hasilnya tidak akan identik dengan model `scikit-learn`, jadi perbedaan dicatat jujur di `PARITY.md`.
- **Hypersync** membutuhkan token dan bisa berubah; fallback RPC harus tetap berfungsi.
- **Beban peta 3D** pada laptop lemah; sediakan penurunan otomatis ke 2D.
- **Kualitas data wallet pada pool v4** terbatas (sender bisa router); selalu tampil sebagai `confidence: low`.


## 18. Landing Page (situs dokumentasi untuk aplikasi lokal)

### 18.1 Tujuan
Wake berjalan di laptop pengguna, bukan situs yang bisa langsung dipakai lewat browser. Orang gampang **salah tangkap** dan mengira ini aplikasi web, lalu mencari tombol "Launch App" atau "Connect Wallet". Landing page ada untuk **meluruskan itu sejak detik pertama**, menjelaskan apa Wake, dan mengantar orang sampai ke instalasi.

Landing page adalah **situs statis**: tidak menjalankan Wake, tidak punya backend, tidak menyimpan data, dan tidak memanggil API apa pun. Dideploy ke Vercel (statis).

### 18.2 Aturan wajib
1. Pesan utama di atas lipatan pertama: **"Wake is local software."** Satu kalimat: *"Wake runs on your own computer. The web views open at a localhost address and nobody else sees your instance. This website is documentation only and does not connect to any backend."*
2. **Dilarang:** tombol "Launch App", "Open App", "Connect Wallet", "Sign in", atau apa pun yang menyiratkan aplikasi hosted. CTA utama adalah **Install** (blok perintah dengan tombol salin).
3. **Dilarang:** angka atau statistik karangan, testimoni, logo mitra, dan klaim performa. Hanya angka yang berasal dari sampel nyata yang kita rekam, dan diberi label sampel.
4. Semua screenshot dan video **diambil dari aplikasi Wake sungguhan** (mode Sample), bukan mockup, dan diberi keterangan "Recorded sample, not a live market feed".
5. Bahasa: Inggris (audiens global). Nada: lugas, teknis, tanpa jargon pemasaran ("revolutionary", "next-gen", dan sejenisnya).
6. Ikon SVG, bukan emoji. Tidak ada gradien dekoratif tanpa alasan fungsi. Kontras memenuhi WCAG AA dan `prefers-reduced-motion` dihormati.
7. Tidak ada wallet, tidak ada cookie pelacak, tidak ada analytics pihak ketiga (opsional: analytics tanpa cookie yang menghormati privasi).

### 18.3 Struktur halaman
| # | Bagian | Isi |
|---|---|---|
| 1 | **Hero** | Judul: "See where capital moves on Robinhood Chain." Sub: satu kalimat penjelasan produk. Di bawahnya callout **local software** (18.2 poin 1). CTA: **Install** dan **Watch the demo**. |
| 2 | **What you see** | 4 kartu ringkas: **Inflow** (ranking token), **Coin Flow** (asal dan tujuan wallet), **Network** (peta jaringan), **Watchlist** (pantau wallet pilihan). Tiap kartu berisi 1 screenshot asli dan 1-2 kalimat. |
| 3 | **Install in 3 steps** | 1) Install Node.js 22+. 2) `git clone` dan `npm install`. 3) `npm run start` lalu buka `http://127.0.0.1:PORT` dan klik Load sample. Blok kode dengan tombol salin. Catatan: tanpa Python, tanpa API key untuk mode Sample. |
| 4 | **Demo** | Video pendek rekaman replay (dari rekaman single-take, lihat panduan video), diputar tanpa suara dengan keterangan. |
| 5 | **How it reads the chain** | Diagram sederhana: RPC publik ke laptop kamu ke tampilan lokal. Satu paragraf: tidak ada server Wake yang menyimpan datamu. |
| 6 | **Honest limits** | Daftar batas: hanya kurva Pons V2 dan pool v4-nya; waktu blok bersifat interpolasi; wallet pada pool v4 bisa berupa router (confidence low); data eksternal hanya di mode Live; verdict bukan saran keuangan. |
| 7 | **FAQ** | Lihat 18.4. |
| 8 | **Footer** | Tautan GitHub, lisensi, atribusi ke STAMPEDE (dengan izin pembuatnya), dan disclaimer "Bukan saran keuangan". |

### 18.4 FAQ (jawaban baku)
- **Is Wake a website I can open?** No. It is software you run on your own computer. This site only explains it.
- **Do I need a wallet?** No. Wake reads public on-chain data. There is no wallet connection.
- **Does it cost anything?** No hosting cost. It uses public RPC by default. Optional keys (Hypersync, X mentions) are free or optional.
- **Where is my data stored?** Only on your machine (`~/.wake/` and the local database). Nothing is sent to us.
- **Do I need Python?** No. Node.js 22+ only.
- **Is this financial advice?** No. Wake shows observed on-chain order of trades. Verdicts are model outputs, not recommendations.
- **Why is nothing showing?** Use Load sample first, or wait for the live backfill to finish.
- **Is it real time?** Only while the app is open in Live mode. It does not run in the background.

### 18.5 Tampilan dan konten visual
- Identitas visual Wake sendiri (bukan gorila/merah STAMPEDE). Palet dan tipografi ditentukan dev bersama desainer, konsisten dengan aplikasi.
- Layout: tidak semua bagian berbentuk kartu seragam; ritme berbeda antar bagian (bagian Install berupa blok kode besar, bagian Honest limits berupa daftar polos).
- Gerak: perpindahan halus dan pemutaran video; tidak ada animasi yang tidak berfungsi.
- Responsif: mobile, tablet, desktop. Di mobile, blok Install tetap terbaca dan tombol salin berfungsi.

### 18.6 Teknis
- Stack: Vite/React statis atau Astro/Next static export. Tanpa runtime server.
- Deploy: Vercel statis. Domain khusus opsional.
- SEO dan sosial: `<title>`, meta description, Open Graph image (tangkapan tampilan Network dari mode Sample), `sitemap`, dan `robots`.
- Performa: skor Lighthouse >= 90 di Performance, Accessibility, dan Best Practices.
- Halaman dokumentasi tambahan (`/docs`) hanya bila ada konten nyata; jangan ada tautan ke halaman yang belum ada (menghindari 404 seperti kasus docs yang error).

### 18.7 Acceptance (landing)
- Callout "local software" terlihat tanpa scroll di desktop dan mobile.
- Tidak ada elemen yang menyiratkan aplikasi hosted (cek manual: tidak ada Launch App, Connect Wallet, atau Sign in).
- Semua screenshot berasal dari aplikasi sungguhan dalam mode Sample dan berlabel.
- Perintah Install dapat disalin, dan diuji pada mesin bersih sampai `npm run start` berjalan.
- Tidak ada tautan mati; tidak ada request jaringan ke domain selain aset milik sendiri (kecuali analytics opsional).
