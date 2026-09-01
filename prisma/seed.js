const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Memulai proses seeding data awal...');

  // 1. Clean Database
  await prisma.activityLog.deleteMany();
  await prisma.caseContribution.deleteMany();
  await prisma.article.deleteMany();
  await prisma.caseStage.deleteMany();
  await prisma.defendant.deleteMany();
  await prisma.case.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create Users (Super Admin, Default Contributor, and 3 approved Contributors)
  const passwordHashAdmin = await bcrypt.hash('admin12345', 10);
  const passwordHashContri = await bcrypt.hash('kontri123', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'Super Admin Januar',
      email: 'jan@hallojanu.xyz',
      passwordHash: passwordHashAdmin,
      role: 'SUPER_ADMIN',
    },
  });

  const contributorBudi = await prisma.user.create({
    data: {
      name: 'Budi (Jurnalis)',
      email: 'budi@hallojanu.xyz',
      passwordHash: passwordHashContri,
      role: 'CONTRIBUTOR',
    },
  });

  const contributorAndi = await prisma.user.create({
    data: {
      name: 'Andi Saputra',
      email: 'andi@hallojanu.xyz',
      passwordHash: passwordHashContri,
      role: 'CONTRIBUTOR',
    },
  });

  const contributorCitra = await prisma.user.create({
    data: {
      name: 'Citra Lestari',
      email: 'citra@hallojanu.xyz',
      passwordHash: passwordHashContri,
      role: 'CONTRIBUTOR',
    },
  });

  const contributorDimas = await prisma.user.create({
    data: {
      name: 'Dimas Pratama',
      email: 'dimas@hallojanu.xyz',
      passwordHash: passwordHashContri,
      role: 'CONTRIBUTOR',
    },
  });

  console.log('✅ Pengguna (Admin & Kontributor) berhasil dibuat.');

  // 3. Create Categories
  const catKorupsi = await prisma.category.create({
    data: { name: 'Korupsi & Pencucian Uang', slug: 'korupsi', color: '#e02424', icon: 'shield-alert' },
  });

  const catPidanaUmum = await prisma.category.create({
    data: { name: 'Pidana Umum', slug: 'pidana-umum', color: '#1a56db', icon: 'gavel' },
  });

  const catPerdata = await prisma.category.create({
    data: { name: 'Perdata', slug: 'perdata', color: '#ff5a1f', icon: 'scale' },
  });

  const catLingkungan = await prisma.category.create({
    data: { name: 'Lingkungan & Agraria', slug: 'lingkungan', color: '#0e9f6e', icon: 'leaf' },
  });

  console.log('✅ Kategori perkara berhasil dibuat.');

  // 4. Seed 5 Cases & Timelines

  // =========================================================================
  // KASUS 1: Kasus Korupsi Bansos Covid-19 (Juliari Batubara)
  // =========================================================================
  const case1 = await prisma.case.create({
    data: {
      caseNumber: '27/Pid.Sus-TPK/2021/PN.Jkt.Pus',
      title: 'Kasus Korupsi Pengadaan Paket Bansos Penanganan Covid-19',
      description: 'Kasus tindak pidana korupsi berupa penerimaan suap/fee dari perusahaan rekanan penyedia bantuan sosial (bansos) sembako penanganan dampak pandemi Covid-19 di Kementerian Sosial RI.',
      categoryId: catKorupsi.id,
      currentStatus: 'PUTUSAN',
    },
  });

  await prisma.defendant.createMany({
    data: [
      { caseId: case1.id, name: 'Juliari P. Batubara', role: 'Terdakwa Utama (Mantan Menteri Sosial RI)' },
      { caseId: case1.id, name: 'Adi Wahyono', role: 'Terdakwa (Pejabat Pembuat Komitmen / KPA Kemensos)' },
    ],
  });

  // Timeline Case 1
  const stage1Case1 = await prisma.caseStage.create({
    data: {
      caseId: case1.id,
      stageType: 'PELAPORAN',
      status: 'SELESAI',
      startedAt: new Date('2020-12-05'),
      endedAt: new Date('2020-12-06'),
      createdById: admin.id,
    },
  });

  await prisma.article.create({
    data: {
      title: 'Operasi Tangkap Tangan (OTT) dan Penyerahan Diri Juliari Batubara',
      content: 'KPK melakukan Operasi Tangkap Tangan (OTT) terhadap pejabat Kemensos dan mengamankan barang bukti uang miliaran rupiah. Setelah ditetapkan sebagai tersangka, Menteri Sosial Juliari P. Batubara menyerahkan diri ke Gedung Merah Putih KPK pada 6 Desember 2020 dini hari.',
      stageId: stage1Case1.id,
      authorId: admin.id,
    },
  });

  const stage2Case1 = await prisma.caseStage.create({
    data: {
      caseId: case1.id,
      stageType: 'PENYIDIKAN',
      status: 'SELESAI',
      startedAt: new Date('2020-12-07'),
      endedAt: new Date('2021-04-15'),
      createdById: admin.id,
    },
  });

  await prisma.article.create({
    data: {
      title: 'Penyidikan Kasus Bansos: Rekonstruksi Proyek dan Aliran Dana',
      content: 'Penyidik KPK menggelar rekonstruksi perkara, memeriksa puluhan saksi dari unsur birokrat Kemensos dan vendor swasta, serta menyita aset-aset terkait aliran dana suap sebesar Rp17 Miliar yang diduga ditujukan untuk kepentingan pribadi Mensos.',
      stageId: stage2Case1.id,
      authorId: admin.id,
    },
  });

  const stage3Case1 = await prisma.caseStage.create({
    data: {
      caseId: case1.id,
      stageType: 'PENUNTUTAN',
      status: 'SELESAI',
      startedAt: new Date('2021-04-16'),
      endedAt: new Date('2021-04-20'),
      createdById: admin.id,
    },
  });

  await prisma.article.create({
    data: {
      title: 'Pelimpahan Berkas Perkara Lengkap (Tahap II) ke JPU',
      content: 'Berkas penyidikan Juliari Batubara dinyatakan lengkap (P21) dan dilimpahkan oleh penyidik KPK kepada Jaksa Penuntut Umum (JPU) untuk segera disusun surat dakwaan persidangan.',
      stageId: stage3Case1.id,
      authorId: admin.id,
    },
  });

  const stage4Case1 = await prisma.caseStage.create({
    data: {
      caseId: case1.id,
      stageType: 'PERSIDANGAN',
      status: 'SELESAI',
      startedAt: new Date('2021-04-21'),
      endedAt: new Date('2021-08-22'),
      createdById: admin.id,
    },
  });

  await prisma.article.create({
    data: {
      title: 'Rangkaian Persidangan di PN Tipikor Jakarta Pusat',
      content: 'JPU mendakwa Juliari Batubara melanggar Pasal 12 huruf a UU Tipikor. Sidang mendengarkan keterangan puluhan saksi ahli dan vendor yang menyetor fee Rp10.000 per paket bansos sembako.',
      stageId: stage4Case1.id,
      authorId: admin.id,
    },
  });

  const stage5Case1 = await prisma.caseStage.create({
    data: {
      caseId: case1.id,
      stageType: 'PUTUSAN',
      status: 'SELESAI',
      startedAt: new Date('2021-08-23'),
      createdById: admin.id,
    },
  });

  await prisma.article.create({
    data: {
      title: 'Pembacaan Vonis Putusan Hakim: 12 Tahun Penjara',
      content: 'Majelis Hakim PN Tipikor Jakarta Pusat menjatuhkan vonis hukuman 12 tahun penjara, denda Rp500 juta, uang pengganti Rp14,5 Miliar, serta pencabutan hak politik untuk dipilih dalam jabatan publik selama 4 tahun pasca menyelesaikan masa pidana.',
      stageId: stage5Case1.id,
      authorId: admin.id,
    },
  });


  // =========================================================================
  // KASUS 2: Kasus Pembunuhan Berencana Brigadir J (Ferdy Sambo)
  // =========================================================================
  const case2 = await prisma.case.create({
    data: {
      caseNumber: '796/Pid.B/2022/PN.Jkt.Sel',
      title: 'Kasus Pembunuhan Berencana Brigadir Nofriansyah Yosua Hutabarat (Brigadir J)',
      description: 'Kasus pembunuhan berencana yang dilakukan di kediaman dinas Kadiv Propam Polri di Duren Tiga, Jakarta Selatan, yang berujung pada tuntutan pelanggaran kode etik serta pidana berat.',
      categoryId: catPidanaUmum.id,
      currentStatus: 'PUTUSAN',
    },
  });

  await prisma.defendant.createMany({
    data: [
      { caseId: case2.id, name: 'Ferdy Sambo', role: 'Terdakwa Utama (Mantan Kadiv Propam Polri)' },
      { caseId: case2.id, name: 'Putri Candrawathi', role: 'Terdakwa (Istri Ferdy Sambo)' },
      { caseId: case2.id, name: 'Richard Eliezer Pudihang Lumiu', role: 'Terdakwa / Justice Collaborator' },
    ],
  });

  // Timeline Case 2
  const stage1Case2 = await prisma.caseStage.create({
    data: {
      caseId: case2.id,
      stageType: 'PELAPORAN',
      status: 'SELESAI',
      startedAt: new Date('2022-07-08'),
      endedAt: new Date('2022-08-08'),
      createdById: admin.id,
    },
  });

  await prisma.article.create({
    data: {
      title: 'Laporan Awal Baku Tembak Palsu dan Penemuan Kejanggalan',
      content: 'Awalnya peristiwa dilaporkan sebagai insiden baku tembak antara Bharada E dan Brigadir J akibat pelecehan seksual. Namun, keluarga menemukan banyak kejanggalan luka fisik dan mendesak autopsi ulang.',
      stageId: stage1Case2.id,
      authorId: admin.id,
    },
  });

  const stage2Case2 = await prisma.caseStage.create({
    data: {
      caseId: case2.id,
      stageType: 'PENYIDIKAN',
      status: 'SELESAI',
      startedAt: new Date('2022-08-09'),
      endedAt: new Date('2022-09-30'),
      createdById: admin.id,
    },
  });

  await prisma.article.create({
    data: {
      title: 'Penetapan Tersangka Ferdy Sambo & Pembongkaran Rekayasa Kasus',
      content: 'Kapolri mengumumkan langsung penetapan Irjen Ferdy Sambo sebagai tersangka utama pembunuhan berencana setelah Bharada E membuat pengakuan tertulis mengenai instruksi penembakan langsung dari atasannya.',
      stageId: stage2Case2.id,
      authorId: admin.id,
    },
  });

  const stage3Case2 = await prisma.caseStage.create({
    data: {
      caseId: case2.id,
      stageType: 'PENUNTUTAN',
      status: 'SELESAI',
      startedAt: new Date('2022-10-01'),
      endedAt: new Date('2022-10-12'),
      createdById: admin.id,
    },
  });

  await prisma.article.create({
    data: {
      title: 'Pelimpahan Berkas P21 Kasus Duren Tiga ke Kejagung',
      content: 'Kejaksaan Agung menyatakan berkas pidana umum pembunuhan berencana dan obstruction of justice (perintangan penyidikan) milik Ferdy Sambo dkk telah lengkap untuk disidangkan.',
      stageId: stage3Case2.id,
      authorId: admin.id,
    },
  });

  const stage4Case2 = await prisma.caseStage.create({
    data: {
      caseId: case2.id,
      stageType: 'PERSIDANGAN',
      status: 'SELESAI',
      startedAt: new Date('2022-10-17'),
      endedAt: new Date('2023-02-12'),
      createdById: admin.id,
    },
  });

  await prisma.article.create({
    data: {
      title: 'Sidang Panjang di Pengadilan Negeri Jakarta Selatan',
      content: 'Proses persidangan berjalan memanas selama 4 bulan. JPU membuktikan pasal 340 KUHP tentang pembunuhan berencana dengan didukung hasil rekaman CCTV pengganti yang sempat dirusak.',
      stageId: stage4Case2.id,
      authorId: admin.id,
    },
  });

  const stage5Case2 = await prisma.caseStage.create({
    data: {
      caseId: case2.id,
      stageType: 'PUTUSAN',
      status: 'SELESAI',
      startedAt: new Date('2023-02-13'),
      createdById: admin.id,
    },
  });

  await prisma.article.create({
    data: {
      title: 'Vonis Mati PN Jaksel Hingga Putusan Kasasi Mahkamah Agung',
      content: 'Setelah awalnya divonis mati oleh PN Jakarta Selatan, Mahkamah Agung pada tingkat Kasasi memutuskan menganulir hukuman Ferdy Sambo menjadi penjara seumur hidup, sementara hukuman Putri Candrawathi dipotong menjadi 10 tahun penjara.',
      stageId: stage5Case2.id,
      authorId: admin.id,
    },
  });


  // =========================================================================
  // KASUS 3: Kasus Korupsi Timah Bangka Belitung (Harvey Moeis)
  // =========================================================================
  const case3 = await prisma.case.create({
    data: {
      caseNumber: '82/Pid.Sus-TPK/2024/PN.Jkt.Pus',
      title: 'Dugaan Korupsi Pengelolaan Niaga Komoditas Timah di Wilayah HGU PT Timah Tbk',
      description: 'Kasus dugaan tindak pidana korupsi komoditas timah di Bangka Belitung yang mengakibatkan kerugian negara dan ekologis masif yang ditafsir mencapai Rp300 Triliun.',
      categoryId: catKorupsi.id,
      currentStatus: 'PERSIDANGAN',
    },
  });

  await prisma.defendant.createMany({
    data: [
      { caseId: case3.id, name: 'Harvey Moeis', role: 'Terdakwa (Representasi PT Refined Bangka Tin)' },
      { caseId: case3.id, name: 'Helena Lim', role: 'Terdakwa (Manager PT Quantum Skyline Exchange)' },
    ],
  });

  // Timeline Case 3
  const stage1Case3 = await prisma.caseStage.create({
    data: {
      caseId: case3.id,
      stageType: 'PELAPORAN',
      status: 'SELESAI',
      startedAt: new Date('2023-11-15'),
      endedAt: new Date('2023-12-20'),
      createdById: admin.id,
    },
  });

  await prisma.article.create({
    data: {
      title: 'Penyelidikan Awal Dugaan Penambangan Liar di Kawasan PT Timah Tbk',
      content: 'Laporan dugaan kerugian ekologi di Bangka Belitung memicu Kejagung melakukan operasi intelijen bisnis untuk memeriksa kerja sama sewa peralatan peleburan timah.',
      stageId: stage1Case3.id,
      authorId: admin.id,
    },
  });

  const stage2Case3 = await prisma.caseStage.create({
    data: {
      caseId: case3.id,
      stageType: 'PENYIDIKAN',
      status: 'SELESAI',
      startedAt: new Date('2023-12-21'),
      endedAt: new Date('2024-07-15'),
      createdById: admin.id,
    },
  });

  await prisma.article.create({
    data: {
      title: 'Pemeriksaan Saksi Ekologis dan Penetapan Tersangka Harvey Moeis',
      content: 'Penyidik Jaksa Agung Muda Bidang Tindak Pidana Khusus (Jampidsus) menetapkan Harvey Moeis dan Helena Lim sebagai tersangka beserta penyitaan puluhan rekening bank, supercar, dan jam tangan mewah.',
      stageId: stage2Case3.id,
      authorId: admin.id,
    },
  });

  const stage3Case3 = await prisma.caseStage.create({
    data: {
      caseId: case3.id,
      stageType: 'PENUNTUTAN',
      status: 'SELESAI',
      startedAt: new Date('2024-07-16'),
      endedAt: new Date('2024-08-10'),
      createdById: admin.id,
    },
  });

  await prisma.article.create({
    data: {
      title: 'Pelimpahan Berkas dan Surat Dakwaan Jaksa Tipikor',
      content: 'Berkas dakwaan setebal ribuan halaman dilimpahkan ke Pengadilan Tipikor Jakarta Pusat dengan fokus pasal kerugian perekonomian negara dan Tindak Pidana Pencucian Uang (TPPU).',
      stageId: stage3Case3.id,
      authorId: admin.id,
    },
  });

  const stage4Case3 = await prisma.caseStage.create({
    data: {
      caseId: case3.id,
      stageType: 'PERSIDANGAN',
      status: 'AKTIF',
      startedAt: new Date('2024-08-14'),
      createdById: admin.id,
    },
  });

  await prisma.article.create({
    data: {
      title: 'Persidangan Berlangsung: Pembuktian Aliran Dana Corporate Social Responsibility',
      content: 'Sidang dibuka untuk umum. Ahli ekologi memaparkan kerusakan lingkungan hidup yang diakibatkan penambangan timah tanpa reklamasi. Harvey didakwa mengalirkan dana korupsi dengan kedok CSR.',
      stageId: stage4Case3.id,
      authorId: admin.id,
    },
  });


  // =========================================================================
  // KASUS 4: Kasus Sengketa Tanah Dago Elos Bandung (Muller Bersaudara)
  // =========================================================================
  const case4 = await prisma.case.create({
    data: {
      caseNumber: '454/Pid.B/2024/PN.Bdg',
      title: 'Sengketa Tanah Pemalsuan Dokumen Klaim Kepemilikan Dago Elos',
      description: 'Kasus pidana pemalsuan surat/dokumen tanah Eigendom Verponding oleh Muller bersaudara untuk mengklaim lahan permukiman Dago Elos Bandung yang merugikan ratusan kepala keluarga.',
      categoryId: catLingkungan.id,
      currentStatus: 'PUTUSAN',
    },
  });

  await prisma.defendant.createMany({
    data: [
      { caseId: case4.id, name: 'Heri Hermawan Muller', role: 'Terdakwa (Muller Bersaudara)' },
      { caseId: case4.id, name: 'Dodi Rustandi Muller', role: 'Terdakwa (Muller Bersaudara)' },
    ],
  });

  // Timeline Case 4
  const stage1Case4 = await prisma.caseStage.create({
    data: {
      caseId: case4.id,
      stageType: 'PELAPORAN',
      status: 'SELESAI',
      startedAt: new Date('2023-08-15'),
      endedAt: new Date('2023-11-20'),
      createdById: admin.id,
    },
  });

  await prisma.article.create({
    data: {
      title: 'Aksi Solidaritas Dago Elos dan Laporan Pidana atas Muller Bersaudara',
      content: 'Warga Dago Elos melayangkan laporan resmi ke Polda Jawa Barat atas dugaan pemalsuan asal-usul tanah adat setelah mereka menerima somasi pengosongan pemukiman.',
      stageId: stage1Case4.id,
      authorId: admin.id,
    },
  });

  const stage2Case4 = await prisma.caseStage.create({
    data: {
      caseId: case4.id,
      stageType: 'PENYIDIKAN',
      status: 'SELESAI',
      startedAt: new Date('2023-11-21'),
      endedAt: new Date('2024-04-10'),
      createdById: admin.id,
    },
  });

  await prisma.article.create({
    data: {
      title: 'Penetapan Tersangka Muller Bersaudara oleh Polda Jabar',
      content: 'Penyidik menetapkan Heri dan Dodi Muller sebagai tersangka pemalsuan dokumen setelah Puslabfor mengonfirmasi sertifikat sengketa terbukti diragukan keasliannya.',
      stageId: stage2Case4.id,
      authorId: admin.id,
    },
  });

  const stage3Case4 = await prisma.caseStage.create({
    data: {
      caseId: case4.id,
      stageType: 'PENUNTUTAN',
      status: 'SELESAI',
      startedAt: new Date('2024-04-11'),
      endedAt: new Date('2024-05-15'),
      createdById: admin.id,
    },
  });

  await prisma.article.create({
    data: {
      title: 'Berkas Dinyatakan Lengkap dan Penyerahan Tersangka ke Kejati',
      content: 'Kejaksaan Tinggi Jabar menerima pelimpahan barang bukti dan menahan tersangka di Rutan Bandung guna menjamin kelancaran persidangan.',
      stageId: stage3Case4.id,
      authorId: admin.id,
    },
  });

  const stage4Case4 = await prisma.caseStage.create({
    data: {
      caseId: case4.id,
      stageType: 'PERSIDANGAN',
      status: 'SELESAI',
      startedAt: new Date('2024-05-16'),
      endedAt: new Date('2024-10-13'),
      createdById: admin.id,
    },
  });

  await prisma.article.create({
    data: {
      title: 'Proses Persidangan Pembuktian Silsilah di PN Bandung',
      content: 'Persidangan berjalan memanas dengan pengawalan ketat aliansi warga. Saksi ahli sejarah menyatakan dokumen Eigendom Verponding Muller tidak tercatat di dinas agraria.',
      stageId: stage4Case4.id,
      authorId: admin.id,
    },
  });

  const stage5Case4 = await prisma.caseStage.create({
    data: {
      caseId: case4.id,
      stageType: 'PUTUSAN',
      status: 'SELESAI',
      startedAt: new Date('2024-10-14'),
      createdById: admin.id,
    },
  });

  await prisma.article.create({
    data: {
      title: 'Vonis Bersalah Muller Bersaudara Dijatuhi 3 Tahun 6 Bulan Penjara',
      content: 'Majelis Hakim PN Bandung membacakan vonis bersalah kepada Muller bersaudara dengan pidana 3,5 tahun penjara karena terbukti bersalah menggunakan akta palsu untuk menuntut kepemilikan lahan.',
      stageId: stage5Case4.id,
      authorId: admin.id,
    },
  });


  // =========================================================================
  // KASUS 5: Kasus Sengketa Pencemaran Udara Jakarta (Citizen Lawsuit)
  // =========================================================================
  const case5 = await prisma.case.create({
    data: {
      caseNumber: '374/Pdt.G/LH/2019/PN.Jkt.Pus',
      title: 'Gugatan Warga Negara atas Pencemaran Udara DKI Jakarta (Citizen Lawsuit)',
      description: 'Gugatan perdata lingkungan hidup yang diajukan oleh koalisi warga terhadap Presiden RI, Menteri LHK, dan Gubernur DKI Jakarta atas kelalaian hak pemenuhan udara bersih.',
      categoryId: catPerdata.id,
      currentStatus: 'PUTUSAN',
    },
  });

  await prisma.defendant.createMany({
    data: [
      { caseId: case5.id, name: 'Pemerintah RI (Presiden, Menteri LHK, Menteri Kesehatan)', role: 'Tergugat Eksekutif Nasional' },
      { caseId: case5.id, name: 'Pemerintah Provinsi DKI Jakarta (Gubernur DKI Jakarta)', role: 'Tergugat Eksekutif Daerah' },
    ],
  });

  // Timeline Case 5 (Pelaporan/Gugatan -> Persidangan -> Putusan)
  const stage1Case5 = await prisma.caseStage.create({
    data: {
      caseId: case5.id,
      stageType: 'PELAPORAN',
      status: 'SELESAI',
      startedAt: new Date('2019-07-04'),
      endedAt: new Date('2019-08-30'),
      createdById: admin.id,
    },
  });

  await prisma.article.create({
    data: {
      title: 'Pendaftaran Gugatan Perdata Citizen Lawsuit oleh Koalisi Semesta',
      content: 'Koalisi Inisiatif Bersihkan Udara Koalisi Semesta (K Ibu) mendaftarkan gugatan perwakilan kelompok masyarakat sipil karena kualitas udara Jakarta terindikasi membahayakan kesehatan.',
      stageId: stage1Case5.id,
      authorId: admin.id,
    },
  });

  const stage2Case5 = await prisma.caseStage.create({
    data: {
      caseId: case5.id,
      stageType: 'PERSIDANGAN',
      status: 'SELESAI',
      startedAt: new Date('2019-09-01'),
      endedAt: new Date('2021-09-15'),
      createdById: admin.id,
    },
  });

  await prisma.article.create({
    data: {
      title: 'Sidang Pembuktian dan Penyerahan Alat Ukur Kualitas PM2.5',
      content: 'Persidangan tertunda berulang kali karena pandemi. Penggugat menyodorkan bukti-bukti ilmiah mengenai rata-rata polusi PM2.5 Jakarta yang melampaui baku mutu nasional.',
      stageId: stage2Case5.id,
      authorId: admin.id,
    },
  });

  const stage3Case5 = await prisma.caseStage.create({
    data: {
      caseId: case5.id,
      stageType: 'PUTUSAN',
      status: 'SELESAI',
      startedAt: new Date('2021-09-16'),
      createdById: admin.id,
    },
  });

  await prisma.article.create({
    data: {
      title: 'Putusan PN Jaksel Mengabulkan Gugatan dan Menghukum Para Tergugat',
      content: 'Majelis Hakim mengetuk palu menyatakan para tergugat lalai dalam menjaga baku mutu udara bersih Jakarta. Tergugat dihukum untuk memasang alat pemantau udara dan merumuskan kebijakan perbaikan kualitas udara Jakarta.',
      stageId: stage3Case5.id,
      authorId: admin.id,
    },
  });

  console.log('✅ 5 Kasus hukum riil beserta tahapan berhasil dibuat.');


  // 5. Create Approved Contributions from Contributors
  console.log('🌱 Menanam kontribusi terverifikasi (Approved) oleh para kontributor...');

  // Kontribusi 1: Andi Saputra untuk Kasus 3 (Timah Harvey Moeis)
  await prisma.caseContribution.create({
    data: {
      caseId: case3.id,
      userId: contributorAndi.id,
      description: 'Kejaksaan Agung menyita 2 mobil mewah Rolls-Royce dan Mini Cooper milik tersangka Harvey Moeis dari kediamannya di Pakubuwono, Jakarta Selatan.',
      status: 'APPROVED',
      proofLinks: JSON.stringify(['https://news.detik.com/kejagung-sita-mobil-mewah-harvey-moeis']),
      proofFiles: JSON.stringify([]),
      reviewedById: admin.id,
    }
  });

  // Kontribusi 2: Citra Lestari untuk Kasus 4 (Dago Elos)
  await prisma.caseContribution.create({
    data: {
      caseId: case4.id,
      userId: contributorCitra.id,
      description: 'PN Bandung menyatakan sertifikat Eigendom Verponding yang diajukan oleh keluarga Muller untuk menuntut lahan Dago Elos adalah palsu.',
      status: 'APPROVED',
      proofLinks: JSON.stringify(['https://www.kompas.com/dago-elos-vonis-muller']),
      proofFiles: JSON.stringify([]),
      reviewedById: admin.id,
    }
  });

  // Kontribusi 3: Dimas Pratama untuk Kasus 5 (Polusi Udara Jakarta)
  await prisma.caseContribution.create({
    data: {
      caseId: case5.id,
      userId: contributorDimas.id,
      description: 'Mahkamah Agung (MA) secara resmi mengeluarkan putusan menolak permohonan kasasi yang diajukan oleh Presiden RI dan Menteri LHK terkait sengketa polusi udara Jakarta.',
      status: 'APPROVED',
      proofLinks: JSON.stringify(['https://nasional.tempo.co/ma-tolak-kasasi-polusi-jakarta']),
      proofFiles: JSON.stringify([]),
      reviewedById: admin.id,
    }
  });

  console.log('✅ Kontribusi tervalidasi (APPROVED) berhasil ditanam.');
  console.log('🌱 Proses seeding data awal SELESAI!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
