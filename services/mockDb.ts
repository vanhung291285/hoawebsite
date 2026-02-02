
import { Post, SchoolConfig, SchoolDocument, GalleryImage, GalleryAlbum, User, UserRole, MenuItem, DisplayBlock, DocumentCategory, StaffMember } from '../types';

const STORAGE_KEYS = {
  POSTS: 'vinaedu_posts_v5', 
  CONFIG: 'vinaedu_config_v4', 
  DOCS: 'vinaedu_docs_v2', 
  DOC_CATS: 'vinaedu_doc_cats',
  USERS: 'vinaedu_users_v2',
  GALLERY: 'vinaedu_gallery_v2', 
  ALBUMS: 'vinaedu_albums_v1',   
  MENU: 'vinaedu_menu_v2', 
  BLOCKS: 'vinaedu_blocks_v3', 
  INIT: 'vinaedu_initialized_v16',
  SESSION: 'vinaedu_session_user',
  STAFF: 'vinaedu_staff_v1'
};

const safeSetItem = (key: string, value: string): boolean => {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (e: any) {
    if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
      console.warn(`LocalStorage quota exceeded when saving ${key}. Clearing old data and retrying...`);
      // Simple cleanup strategy: Remove keys that are likely old versions or large temp data
      try {
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
           const k = localStorage.key(i);
           if (k && k.startsWith('vinaedu_') && !Object.values(STORAGE_KEYS).includes(k)) {
               keysToRemove.push(k);
           }
        }
        keysToRemove.forEach(k => localStorage.removeItem(k));
        
        // Retry once
        try {
            localStorage.setItem(key, value);
            return true;
        } catch (retryErr) {
            console.error(`Retry failed for ${key}. Storage is genuinely full.`);
            return false;
        }
      } catch (cleanupErr) {
        console.error("Error during storage cleanup", cleanupErr);
        return false;
      }
    } else {
      console.error(`Error saving ${key}:`, e);
      return false;
    }
  }
};

const DEFAULT_CONFIG: SchoolConfig = {
  // General
  name: 'Trường PTDTBT TH và THCS Suối Lư',
  slogan: 'Trách nhiệm - Yêu thương - Sáng tạo',
  logoUrl: 'https://upload.wikimedia.org/wikipedia/vi/1/13/Logo_THPT_Chuyen_Ha_Noi_-_Amsterdam.png',
  faviconUrl: '', // Default empty
  bannerUrl: 'https://i.imgur.com/8QZq1jS.jpeg',
  principalName: 'Trần Thùy Dương',
  
  // Contact
  address: 'Số 1, Đường Hoàng Minh Giám, Quận Cầu Giấy, Hà Nội',
  phone: '(024) 38463096',
  hotline: '0988 123 456',
  email: 'c3hanoi-ams@hanoiedu.vn',
  mapUrl: '',

  // Social
  facebook: 'https://facebook.com',
  youtube: 'https://youtube.com',
  website: 'https://hn-ams.edu.vn',

  // Display
  showWelcomeBanner: true,
  homeNewsCount: 6,
  homeShowProgram: true,
  primaryColor: '#1e3a8a', // blue-900

  // SEO
  metaTitle: 'Trường THPT Chuyên Hà Nội - Amsterdam',
  metaDescription: 'Cổng thông tin điện tử chính thức của Trường THPT Chuyên Hà Nội - Amsterdam. Cập nhật tin tức, sự kiện, tài liệu học tập mới nhất.'
};

const DEFAULT_DOC_CATS: DocumentCategory[] = [
  { id: 'cat_official', name: 'Văn bản hành chính', slug: 'official', description: 'Quyết định, thông báo chính thức', order: 1 },
  { id: 'cat_resource', name: 'Tài liệu học tập', slug: 'resource', description: 'Đề cương, bài giảng', order: 2 },
  { id: 'cat_timetable', name: 'Thời khóa biểu', slug: 'timetable', description: 'Lịch học các khối lớp', order: 3 },
];

const DEFAULT_DOCS: SchoolDocument[] = [
  { 
      id: '1', 
      number: '125/QĐ-THPT', 
      title: 'Quyết định về việc thành lập Ban chỉ đạo thi THPT Quốc gia (Bản mẫu PDF)', 
      date: '2024-05-10', 
      categoryId: 'cat_official', 
      // Using a real PDF for preview testing
      downloadUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' 
  },
  { 
      id: '2', 
      number: 'TB-01', 
      title: 'Thời khóa biểu học kỳ 1 năm học 2024-2025', 
      date: '2024-08-15', 
      categoryId: 'cat_timetable', 
      downloadUrl: '#' 
  },
];

const DEFAULT_BLOCKS: DisplayBlock[] = [
  // Main Content Blocks
  { id: 'block_hero', name: 'Slide Tin Nổi Bật', position: 'main', type: 'hero', order: 1, itemCount: 3, isVisible: true, targetPage: 'home' },
  { id: 'block_latest', name: 'Tin tức - Sự kiện', position: 'main', type: 'grid', order: 2, itemCount: 6, isVisible: true, targetPage: 'home' },
  { id: 'block_activity', name: 'Hoạt động Ngoại khóa', position: 'main', type: 'highlight', order: 3, itemCount: 4, isVisible: true, targetPage: 'home' },
  
  // Sidebar Blocks
  { id: 'block_sidebar_latest', name: 'TIN MỚI NHẤT', position: 'sidebar', type: 'list', order: 0, itemCount: 10, isVisible: true, targetPage: 'all' },
  { id: 'block_sidebar_ann', name: 'Thông báo mới', position: 'sidebar', type: 'list', order: 1, itemCount: 5, isVisible: true, targetPage: 'all' },
  { id: 'block_sidebar_docs', name: 'Tài liệu tải về', position: 'sidebar', type: 'docs', order: 2, itemCount: 5, isVisible: true, targetPage: 'all' },
  { 
    id: 'block_sidebar_html', 
    name: 'Liên kết website', 
    position: 'sidebar', 
    type: 'html', 
    order: 3, 
    itemCount: 1, 
    isVisible: true, 
    targetPage: 'all',
    htmlContent: '<ul class="space-y-2"><li class="border-b pb-1"><a href="#" class="text-blue-700 hover:underline">Bộ Giáo dục & Đào tạo</a></li><li class="border-b pb-1"><a href="#" class="text-blue-700 hover:underline">Sở GD&ĐT Hà Nội</a></li><li class="border-b pb-1"><a href="#" class="text-blue-700 hover:underline">Cổng thi đua khen thưởng</a></li></ul>'
  },
  { id: 'block_stats', name: 'Thống kê truy cập', position: 'sidebar', type: 'stats', order: 4, itemCount: 1, isVisible: true, targetPage: 'all' },
];

const DEFAULT_POSTS: Post[] = [
  {
    id: '1',
    title: 'Lễ Khai giảng năm học mới 2024-2025',
    slug: 'le-khai-giang-nam-hoc-moi-2024-2025',
    summary: 'Hòa chung không khí tưng bừng của cả nước, sáng ngày 5/9, thầy và trò nhà trường đã long trọng tổ chức Lễ khai giảng.',
    content: '<p style="text-align: justify;">Sáng ngày 5/9, trong không khí tưng bừng của ngày hội toàn dân đưa trẻ đến trường, thầy và trò <b style="color: #1e3a8a;">Trường THPT Chuyên Hà Nội - Amsterdam</b> đã long trọng tổ chức Lễ khai giảng năm học 2024-2025.</p><p>Đến dự buổi lễ có các đồng chí lãnh đạo Sở Giáo dục & Đào tạo, đại diện Hội cha mẹ học sinh cùng toàn thể cán bộ, giáo viên, nhân viên và hơn 2000 học sinh nhà trường.</p><img src="https://picsum.photos/800/400?random=1" style="width: 100%; border-radius: 8px; margin: 10px 0;" alt="Lễ khai giảng"/><p style="text-align: center; font-style: italic;">Toàn cảnh buổi lễ khai giảng trang trọng</p>',
    thumbnail: 'https://picsum.photos/800/400?random=1',
    imageCaption: 'Toàn cảnh lễ khai giảng',
    author: 'Ban Truyền Thông',
    date: '2024-09-05',
    category: 'news',
    tags: ['khai giảng', 'năm học mới'],
    views: 1250,
    status: 'published',
    isFeatured: true,
    showOnHome: true,
    blockIds: ['block_hero', 'block_latest', 'block_sidebar_latest'],
    attachments: []
  },
  {
    id: '2',
    title: 'Thông báo lịch thi học kỳ I',
    slug: 'thong-bao-lich-thi-hoc-ky-i',
    summary: 'Nhà trường thông báo lịch thi học kỳ I cho toàn thể học sinh khối 10, 11, 12.',
    content: '<p>Căn cứ vào kế hoạch năm học, nhà trường thông báo lịch thi học kỳ I như sau:</p><ul><li>Khối 12: Thi từ ngày 15/12</li><li>Khối 10, 11: Thi từ ngày 20/12</li></ul><p>Đề nghị các em học sinh ôn tập nghiêm túc.</p>',
    thumbnail: 'https://picsum.photos/800/400?random=2',
    imageCaption: 'Lịch thi chi tiết',
    author: 'Phòng Đào Tạo',
    date: '2024-11-20',
    category: 'announcement',
    tags: ['thi cử', 'học kỳ 1'],
    views: 890,
    status: 'published',
    isFeatured: false,
    showOnHome: true,
    blockIds: ['block_sidebar_ann', 'block_latest', 'block_sidebar_latest'],
    attachments: [
       { id: 'att1', name: 'Lịch thi chi tiết.pdf', url: '#', type: 'file', fileType: 'pdf' }
    ]
  },
  {
    id: '3',
    title: 'Hội trại 26/3 - Sức trẻ thanh niên',
    slug: 'hoi-trai-26-3-suc-tre-thanh-nien',
    summary: 'Sôi động, nhiệt huyết và đầy sáng tạo là những gì diễn ra tại Hội trại chào mừng ngày thành lập Đoàn.',
    content: '<p>Đoàn trường đã tổ chức thành công hội trại với nhiều hoạt động ý nghĩa: Thi cắm trại, nấu ăn, văn nghệ...</p>',
    thumbnail: 'https://picsum.photos/800/400?random=3',
    imageCaption: 'Học sinh tham gia hội trại',
    author: 'Đoàn Thanh Niên',
    date: '2024-03-26',
    category: 'activity',
    tags: ['đoàn thanh niên', 'ngoại khóa'],
    views: 2100,
    status: 'published',
    isFeatured: false,
    showOnHome: true,
    blockIds: ['block_activity', 'block_latest', 'block_sidebar_latest'], 
    attachments: []
  },
  {
    id: '4',
    title: 'Hội thảo chuyên môn Toán học',
    slug: 'hoi-thao-chuyen-mon-toan-hoc',
    summary: 'Chia sẻ kinh nghiệm giảng dạy chương trình mới.',
    content: '<p>Nội dung chi tiết về các phương pháp giảng dạy tích cực môn Toán...</p>',
    thumbnail: 'https://picsum.photos/800/400?random=4',
    imageCaption: 'Các thầy cô thảo luận',
    author: 'Tổ Toán',
    date: '2024-10-15',
    category: 'professional',
    tags: ['chuyên môn', 'toán'],
    views: 450,
    status: 'published',
    isFeatured: false,
    showOnHome: true,
    blockIds: ['block_professional', 'block_latest', 'block_sidebar_latest'], 
    attachments: []
  },
  {
    id: '5',
    title: 'Hội thi Giao lưu toán tuổi thơ cấp xã',
    slug: 'hoi-thi-giao-luu-toan-tuoi-tho',
    summary: 'Sân chơi bổ ích cho học sinh vùng cao.',
    content: '...',
    thumbnail: 'https://picsum.photos/800/400?random=5',
    imageCaption: '',
    author: 'Tổ Toán',
    date: '2024-12-05',
    category: 'news',
    tags: ['toán'],
    views: 300,
    status: 'published',
    isFeatured: false,
    showOnHome: true,
    blockIds: ['block_sidebar_latest'],
    attachments: []
  },
  {
    id: '6',
    title: 'Học sinh trường tham gia thi đấu thể thao',
    slug: 'thi-dau-the-thao',
    summary: 'Mừng đảng mừng xuân 2026',
    content: '...',
    thumbnail: 'https://picsum.photos/800/400?random=6',
    imageCaption: '',
    author: 'Tổ Thể Dục',
    date: '2026-01-20',
    category: 'activity',
    tags: ['thể thao'],
    views: 350,
    status: 'published',
    isFeatured: false,
    showOnHome: true,
    blockIds: ['block_sidebar_latest'],
    attachments: []
  }
];

const DEFAULT_USERS: User[] = [
  { id: '1', username: 'admin', password: 'admin123', fullName: 'Quản trị viên', role: UserRole.ADMIN, email: 'admin@school.edu.vn' },
  { id: '2', username: 'editor', password: '123', fullName: 'Biên tập viên', role: UserRole.EDITOR, email: 'editor@school.edu.vn' },
];

const DEFAULT_MENU: MenuItem[] = [
  { id: '1', label: 'Trang chủ', path: 'home', order: 1 },
  { id: '2', label: 'Giới thiệu', path: 'intro', order: 2 },
  { id: '6', label: 'Đội ngũ GV', path: 'staff', order: 3 }, // Added Staff Page
  { id: '3', label: 'Tin tức', path: 'news', order: 4 },
  { id: '4', label: 'Văn bản', path: 'documents', order: 5 },
  { id: '5', label: 'Thư viện', path: 'gallery', order: 6 },
];

const DEFAULT_ALBUMS: GalleryAlbum[] = [
  { id: 'album_1', title: 'Hoạt động Khai giảng 2024', description: 'Hình ảnh lễ khai giảng năm học mới', thumbnail: 'https://picsum.photos/600/400?random=10', createdDate: '2024-09-05' },
  { id: 'album_2', title: 'Hội thi văn nghệ 20/11', description: 'Chào mừng ngày nhà giáo Việt Nam', thumbnail: 'https://picsum.photos/600/400?random=11', createdDate: '2024-11-20' },
  { id: 'album_3', title: 'Hoạt động Ngoại khóa', description: 'Các hoạt động trải nghiệm sáng tạo', thumbnail: 'https://picsum.photos/600/400?random=12', createdDate: '2024-12-15' },
];

const DEFAULT_GALLERY: GalleryImage[] = [
   { id: '1', url: 'https://picsum.photos/600/400?random=10', caption: 'Khai giảng 1', albumId: 'album_1' },
   { id: '2', url: 'https://picsum.photos/600/400?random=20', caption: 'Khai giảng 2', albumId: 'album_1' },
   { id: '3', url: 'https://picsum.photos/600/400?random=11', caption: 'Văn nghệ 1', albumId: 'album_2' },
   { id: '4', url: 'https://picsum.photos/600/400?random=12', caption: 'Ngoại khóa 1', albumId: 'album_3' },
];

const DEFAULT_STAFF: StaffMember[] = [
  { id: '1', fullName: 'Nguyễn Văn A', position: 'Hiệu trưởng', email: 'ht@school.edu.vn', avatarUrl: '', order: 1 },
  { id: '2', fullName: 'Trần Thị B', position: 'Phó Hiệu trưởng', email: 'hp@school.edu.vn', avatarUrl: '', order: 2 },
];

export const MockDb = {
  init: () => {
    // Only init if INIT key is missing AND we can successfully write to storage
    if (!localStorage.getItem(STORAGE_KEYS.INIT)) {
      console.log("Initializing Mock DB with default data...");
      
      // Try to save config first as a test
      if (!safeSetItem(STORAGE_KEYS.CONFIG, JSON.stringify(DEFAULT_CONFIG))) {
          console.warn("Storage full or unavailable. Using in-memory defaults.");
          return;
      }

      safeSetItem(STORAGE_KEYS.POSTS, JSON.stringify(DEFAULT_POSTS));
      safeSetItem(STORAGE_KEYS.DOCS, JSON.stringify(DEFAULT_DOCS));
      safeSetItem(STORAGE_KEYS.DOC_CATS, JSON.stringify(DEFAULT_DOC_CATS));
      safeSetItem(STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_USERS));
      safeSetItem(STORAGE_KEYS.GALLERY, JSON.stringify(DEFAULT_GALLERY));
      safeSetItem(STORAGE_KEYS.ALBUMS, JSON.stringify(DEFAULT_ALBUMS));
      safeSetItem(STORAGE_KEYS.MENU, JSON.stringify(DEFAULT_MENU));
      safeSetItem(STORAGE_KEYS.BLOCKS, JSON.stringify(DEFAULT_BLOCKS));
      safeSetItem(STORAGE_KEYS.STAFF, JSON.stringify(DEFAULT_STAFF));
      safeSetItem(STORAGE_KEYS.INIT, 'true');
    }
  },

  getConfig: (): SchoolConfig => {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.CONFIG);
        return data ? JSON.parse(data) : DEFAULT_CONFIG;
    } catch {
        return DEFAULT_CONFIG;
    }
  },
  
  saveConfig: (config: SchoolConfig) => {
    if (!safeSetItem(STORAGE_KEYS.CONFIG, JSON.stringify(config))) {
        throw new Error("Không thể lưu cấu hình do bộ nhớ đầy.");
    }
  },

  // Visitor Stats
  getVisitorStats: () => {
      return {
        total: 12500 + Math.floor(Math.random() * 100),
        today: 150 + Math.floor(Math.random() * 20),
        month: 4500 + Math.floor(Math.random() * 50),
        online: 1 + Math.floor(Math.random() * 5)
      };
  },

  // Auth & Users
  login: (username: string, password: string): User | null => {
    const users: User[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || JSON.stringify(DEFAULT_USERS));
    // Check username OR email (case-insensitive for email)
    const user = users.find(u => 
      (u.username === username || (u.email && u.email.toLowerCase() === username.toLowerCase())) && 
      u.password === password
    );
    if (user) {
      const { password, ...safeUser } = user;
      safeSetItem(STORAGE_KEYS.SESSION, JSON.stringify(safeUser));
      return safeUser as User;
    }
    return null;
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
  },

  getCurrentUser: (): User | null => {
    const session = localStorage.getItem(STORAGE_KEYS.SESSION);
    return session ? JSON.parse(session) : null;
  },

  getUsers: (): User[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || JSON.stringify(DEFAULT_USERS)),
  saveUser: (user: User) => {
    const users = MockDb.getUsers();
    if (!user.password) user.password = '123456'; 
    const index = users.findIndex(u => u.id === user.id);
    if (index >= 0) {
       user.password = users[index].password;
       users[index] = user; 
    } else {
       users.push(user);
    }
    safeSetItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },
  deleteUser: (id: string) => {
      const users = MockDb.getUsers().filter(u => u.id !== id);
      safeSetItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },

  // Posts
  getPosts: (): Post[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.POSTS) || JSON.stringify(DEFAULT_POSTS)),
  savePost: (post: Post) => {
    const posts = MockDb.getPosts();
    const index = posts.findIndex(p => p.id === post.id);
    if (index >= 0) posts[index] = post; else posts.unshift(post);
    if (!safeSetItem(STORAGE_KEYS.POSTS, JSON.stringify(posts))) throw new Error("Storage Full");
  },
  deletePost: (id: string) => {
    const posts = MockDb.getPosts().filter(p => p.id !== id);
    safeSetItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
  },

  // Blocks
  getBlocks: (): DisplayBlock[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.BLOCKS) || JSON.stringify(DEFAULT_BLOCKS)),
  saveBlock: (block: DisplayBlock) => {
    const blocks = MockDb.getBlocks();
    const index = blocks.findIndex(b => b.id === block.id);
    if (index >= 0) blocks[index] = block; else blocks.push(block);
    safeSetItem(STORAGE_KEYS.BLOCKS, JSON.stringify(blocks));
  },
  deleteBlock: (id: string) => {
    const blocks = MockDb.getBlocks().filter(b => b.id !== id);
    safeSetItem(STORAGE_KEYS.BLOCKS, JSON.stringify(blocks));
  },
  saveBlocksOrder: (blocks: DisplayBlock[]) => {
      safeSetItem(STORAGE_KEYS.BLOCKS, JSON.stringify(blocks));
  },

  // Document Categories
  getDocCategories: (): DocumentCategory[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.DOC_CATS) || JSON.stringify(DEFAULT_DOC_CATS)),
  saveDocCategory: (cat: DocumentCategory) => {
    const cats = MockDb.getDocCategories();
    const index = cats.findIndex(c => c.id === cat.id);
    if (index >= 0) cats[index] = cat; else cats.push(cat);
    safeSetItem(STORAGE_KEYS.DOC_CATS, JSON.stringify(cats));
  },
  deleteDocCategory: (id: string) => {
    const cats = MockDb.getDocCategories().filter(c => c.id !== id);
    safeSetItem(STORAGE_KEYS.DOC_CATS, JSON.stringify(cats));
  },

  // Documents
  getDocuments: (categoryId?: string) => {
     const docs: SchoolDocument[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.DOCS) || JSON.stringify(DEFAULT_DOCS));
     return categoryId ? docs.filter(d => d.categoryId === categoryId) : docs;
  },
  saveDocument: (doc: any) => {
      const docs = MockDb.getDocuments();
      const index = docs.findIndex((d:any) => d.id === doc.id);
      if (index >= 0) docs[index] = doc; else docs.unshift(doc);
      safeSetItem(STORAGE_KEYS.DOCS, JSON.stringify(docs));
  },
  deleteDocument: (id: string) => {
      const docs = MockDb.getDocuments().filter((d:any) => d.id !== id);
      safeSetItem(STORAGE_KEYS.DOCS, JSON.stringify(docs));
  },
  
  // Gallery Albums
  getAlbums: (): GalleryAlbum[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.ALBUMS) || JSON.stringify(DEFAULT_ALBUMS)),
  saveAlbum: (album: GalleryAlbum) => {
      const albums = MockDb.getAlbums();
      const index = albums.findIndex(a => a.id === album.id);
      if (index >= 0) albums[index] = album; else albums.unshift(album);
      if (!safeSetItem(STORAGE_KEYS.ALBUMS, JSON.stringify(albums))) throw new Error("Storage Full");
  },
  deleteAlbum: (id: string) => {
      const albums = MockDb.getAlbums().filter(a => a.id !== id);
      safeSetItem(STORAGE_KEYS.ALBUMS, JSON.stringify(albums));
  },

  // Gallery Images
  getGallery: () => JSON.parse(localStorage.getItem(STORAGE_KEYS.GALLERY) || JSON.stringify(DEFAULT_GALLERY)),
  saveImage: (img: any) => {
      const images = JSON.parse(localStorage.getItem(STORAGE_KEYS.GALLERY) || '[]');
      images.unshift(img);
      if (!safeSetItem(STORAGE_KEYS.GALLERY, JSON.stringify(images))) throw new Error("Storage Full");
  },
  deleteImage: (id: string) => {
      const images = JSON.parse(localStorage.getItem(STORAGE_KEYS.GALLERY) || '[]').filter((i:any) => i.id !== id);
      safeSetItem(STORAGE_KEYS.GALLERY, JSON.stringify(images));
  },

  // Menu
  getMenu: () => JSON.parse(localStorage.getItem(STORAGE_KEYS.MENU) || JSON.stringify(DEFAULT_MENU)),
  saveMenu: (items: any) => safeSetItem(STORAGE_KEYS.MENU, JSON.stringify(items)),

  // Staff
  getStaff: (): StaffMember[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.STAFF) || JSON.stringify(DEFAULT_STAFF)),
  saveStaff: (staff: StaffMember) => {
    const list: StaffMember[] = MockDb.getStaff();
    const index = list.findIndex(s => s.id === staff.id);
    if (index >= 0) {
        list[index] = staff;
    } else {
        if (!staff.id) staff.id = `staff_${Date.now()}`;
        list.push(staff);
    }
    safeSetItem(STORAGE_KEYS.STAFF, JSON.stringify(list));
  },
  deleteStaff: (id: string) => {
      const list = MockDb.getStaff().filter(s => s.id !== id);
      safeSetItem(STORAGE_KEYS.STAFF, JSON.stringify(list));
  },
};
