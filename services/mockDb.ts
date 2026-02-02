
import { Post, SchoolConfig, SchoolDocument, GalleryImage, GalleryAlbum, User, UserRole, MenuItem, DisplayBlock, DocumentCategory, StaffMember, Video, IntroductionArticle, PostCategory } from '../types';

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
  STAFF: 'vinaedu_staff_v1',
  VIDEOS: 'vinaedu_videos_v1',
  INTRO: 'vinaedu_intro_v1',
  POST_CATS: 'vinaedu_post_cats_v1'
};

// Hàm lưu trữ an toàn: Bắt lỗi quota và cố gắng dọn dẹp
const safeSetItem = (key: string, value: string): boolean => {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (e: any) {
    if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
      console.warn(`LocalStorage quota exceeded when saving ${key}. Attempting cleanup...`);
      
      try {
        const currentKeys = Object.values(STORAGE_KEYS);
        const keysToRemove = [];
        
        for (let i = 0; i < localStorage.length; i++) {
           const k = localStorage.key(i);
           if (k && k.startsWith('vinaedu_') && !currentKeys.includes(k)) {
               keysToRemove.push(k);
           }
        }
        
        keysToRemove.forEach(k => localStorage.removeItem(k));
        
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
  name: 'Trường PTDTBT TH và THCS Suối Lư',
  slogan: 'Trách nhiệm - Yêu thương - Sáng tạo',
  logoUrl: 'https://upload.wikimedia.org/wikipedia/vi/1/13/Logo_THPT_Chuyen_Ha_Noi_-_Amsterdam.png',
  faviconUrl: '',
  bannerUrl: 'https://i.imgur.com/8QZq1jS.jpeg',
  principalName: 'Trần Thùy Dương',
  address: 'Số 1, Đường Hoàng Minh Giám, Quận Cầu Giấy, Hà Nội',
  phone: '(024) 38463096',
  hotline: '0988 123 456',
  email: 'c3hanoi-ams@hanoiedu.vn',
  mapUrl: '',
  facebook: 'https://facebook.com',
  youtube: 'https://youtube.com',
  website: 'https://hn-ams.edu.vn',
  showWelcomeBanner: true,
  homeNewsCount: 6,
  homeShowProgram: true,
  primaryColor: '#1e3a8a',
  metaTitle: 'Trường THPT Chuyên Hà Nội - Amsterdam',
  metaDescription: 'Cổng thông tin điện tử chính thức.'
};

const DEFAULT_DOC_CATS: DocumentCategory[] = [
  { id: 'cat_official', name: 'Văn bản hành chính', slug: 'official', description: 'Quyết định, thông báo chính thức', order: 1 },
  { id: 'cat_resource', name: 'Tài liệu học tập', slug: 'resource', description: 'Đề cương, bài giảng', order: 2 },
  { id: 'cat_timetable', name: 'Thời khóa biểu', slug: 'timetable', description: 'Lịch học các khối lớp', order: 3 },
];

const DEFAULT_POST_CATS: PostCategory[] = [
  { id: 'pc_1', name: 'Tin tức', slug: 'news', color: 'blue', order: 1 },
  { id: 'pc_2', name: 'Thông báo', slug: 'announcement', color: 'red', order: 2 },
  { id: 'pc_3', name: 'Hoạt động', slug: 'activity', color: 'green', order: 3 },
  { id: 'pc_4', name: 'Chuyên môn', slug: 'professional', color: 'indigo', order: 4 },
];

const DEFAULT_VIDEOS: Video[] = [
  { id: 'v1', title: 'Giới thiệu nhà trường', youtubeUrl: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ', order: 1 },
  { id: 'v2', title: 'Hoạt động ngoại khóa 2024', youtubeUrl: 'https://www.youtube.com/watch?v=LXb3EKWsInQ', order: 2 }
];

const DEFAULT_INTRO: IntroductionArticle[] = [
  { id: 'intro_1', title: 'Tổng quan nhà trường', slug: 'tong-quan', content: '<p>Trường được thành lập...</p>', order: 1, isVisible: true },
  { id: 'intro_2', title: 'Cơ cấu tổ chức', slug: 'co-cau', content: '<p>Sơ đồ tổ chức...</p>', order: 2, isVisible: true }
];

const DEFAULT_DOCS: SchoolDocument[] = [
  { 
      id: '1', 
      number: '125/QĐ-THPT', 
      title: 'Quyết định về việc thành lập Ban chỉ đạo thi THPT Quốc gia (Bản mẫu PDF)', 
      date: '2024-05-10', 
      categoryId: 'cat_official', 
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
  { id: 'block_hero', name: 'Slide Tin Nổi Bật', position: 'main', type: 'hero', order: 1, itemCount: 3, isVisible: true, targetPage: 'home' },
  { id: 'block_latest', name: 'Tin tức - Sự kiện', position: 'main', type: 'grid', order: 2, itemCount: 6, isVisible: true, targetPage: 'home' },
  { id: 'block_activity', name: 'Hoạt động Ngoại khóa', position: 'main', type: 'highlight', order: 3, itemCount: 4, isVisible: true, targetPage: 'home' },
  { id: 'block_sidebar_latest', name: 'TIN MỚI NHẤT', position: 'sidebar', type: 'list', order: 0, itemCount: 10, isVisible: true, targetPage: 'all' },
  { id: 'block_sidebar_ann', name: 'Thông báo mới', position: 'sidebar', type: 'list', order: 1, itemCount: 5, isVisible: true, targetPage: 'all' },
  { id: 'block_sidebar_docs', name: 'Tài liệu tải về', position: 'sidebar', type: 'docs', order: 2, itemCount: 5, isVisible: true, targetPage: 'all' },
  { id: 'block_sidebar_video', name: 'Video Hoạt động', position: 'sidebar', type: 'video', order: 3, itemCount: 5, isVisible: true, targetPage: 'all' },
  { 
    id: 'block_sidebar_html', 
    name: 'Liên kết website', 
    position: 'sidebar', 
    type: 'html', 
    order: 4, 
    itemCount: 1, 
    isVisible: true, 
    targetPage: 'all',
    htmlContent: '<ul class="space-y-2"><li class="border-b pb-1"><a href="#" class="text-blue-700 hover:underline">Bộ Giáo dục & Đào tạo</a></li><li class="border-b pb-1"><a href="#" class="text-blue-700 hover:underline">Sở GD&ĐT Hà Nội</a></li></ul>'
  },
  { id: 'block_stats', name: 'Thống kê truy cập', position: 'sidebar', type: 'stats', order: 5, itemCount: 1, isVisible: true, targetPage: 'all' },
];

const DEFAULT_POSTS: Post[] = [
  {
    id: '1',
    title: 'Lễ Khai giảng năm học mới 2024-2025',
    slug: 'le-khai-giang-nam-hoc-moi-2024-2025',
    summary: 'Hòa chung không khí tưng bừng của cả nước, sáng ngày 5/9, thầy và trò nhà trường đã long trọng tổ chức Lễ khai giảng.',
    content: '<p>Nội dung chi tiết...</p>',
    thumbnail: 'https://picsum.photos/800/400?random=1',
    imageCaption: 'Toàn cảnh lễ khai giảng',
    author: 'Ban Truyền Thông',
    date: '2024-09-05',
    category: 'news',
    tags: ['khai giảng'],
    views: 1250,
    status: 'published',
    isFeatured: true,
    showOnHome: true,
    blockIds: ['block_hero', 'block_latest'],
    attachments: []
  },
  // ... more posts if needed
];

const DEFAULT_USERS: User[] = [
  { id: '1', username: 'admin', password: 'admin123', fullName: 'Quản trị viên', role: UserRole.ADMIN, email: 'admin@school.edu.vn' },
  { id: '2', username: 'editor', password: '123', fullName: 'Biên tập viên', role: UserRole.EDITOR, email: 'editor@school.edu.vn' },
];

const DEFAULT_MENU: MenuItem[] = [
  { id: '1', label: 'Trang chủ', path: 'home', order: 1 },
  { id: '2', label: 'Giới thiệu', path: 'intro', order: 2 },
  { id: '6', label: 'Đội ngũ GV', path: 'staff', order: 3 },
  { id: '3', label: 'Tin tức', path: 'news', order: 4 },
  { id: '4', label: 'Văn bản', path: 'documents', order: 5 },
  { id: '5', label: 'Thư viện', path: 'gallery', order: 6 },
];

const DEFAULT_ALBUMS: GalleryAlbum[] = [
  { id: 'album_1', title: 'Hoạt động Khai giảng 2024', description: 'Hình ảnh lễ khai giảng', thumbnail: 'https://picsum.photos/600/400?random=10', createdDate: '2024-09-05' },
];

const DEFAULT_GALLERY: GalleryImage[] = [
   { id: '1', url: 'https://picsum.photos/600/400?random=10', caption: 'Khai giảng 1', albumId: 'album_1' },
];

const DEFAULT_STAFF: StaffMember[] = [
  { id: '1', fullName: 'Nguyễn Văn A', position: 'Hiệu trưởng', email: 'ht@school.edu.vn', avatarUrl: '', order: 1 },
];

export const MockDb = {
  init: () => {
    if (!localStorage.getItem(STORAGE_KEYS.INIT)) {
      console.log("Initializing Mock DB with default data...");
      if (!safeSetItem(STORAGE_KEYS.CONFIG, JSON.stringify(DEFAULT_CONFIG))) {
          console.warn("LocalStorage is full.");
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
      safeSetItem(STORAGE_KEYS.VIDEOS, JSON.stringify(DEFAULT_VIDEOS));
      safeSetItem(STORAGE_KEYS.INTRO, JSON.stringify(DEFAULT_INTRO));
      safeSetItem(STORAGE_KEYS.POST_CATS, JSON.stringify(DEFAULT_POST_CATS));
      safeSetItem(STORAGE_KEYS.INIT, 'true');
    }
  },

  getConfig: (): SchoolConfig => {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.CONFIG);
        return data ? JSON.parse(data) : DEFAULT_CONFIG;
    } catch { return DEFAULT_CONFIG; }
  },
  
  saveConfig: (config: SchoolConfig) => safeSetItem(STORAGE_KEYS.CONFIG, JSON.stringify(config)),

  getVisitorStats: () => {
      return {
        total: 12500 + Math.floor(Math.random() * 100),
        today: 150 + Math.floor(Math.random() * 20),
        month: 4500 + Math.floor(Math.random() * 50),
        online: 1 + Math.floor(Math.random() * 5)
      };
  },

  login: (username: string, password: string): User | null => {
    const users: User[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || JSON.stringify(DEFAULT_USERS));
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

  logout: () => localStorage.removeItem(STORAGE_KEYS.SESSION),
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

  getPosts: (): Post[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.POSTS) || JSON.stringify(DEFAULT_POSTS)),
  savePost: (post: Post) => {
    const posts = MockDb.getPosts();
    const index = posts.findIndex(p => p.id === post.id);
    if (index >= 0) posts[index] = post; else posts.unshift(post);
    safeSetItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
  },
  deletePost: (id: string) => {
    const posts = MockDb.getPosts().filter(p => p.id !== id);
    safeSetItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
  },

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
  saveBlocksOrder: (blocks: DisplayBlock[]) => safeSetItem(STORAGE_KEYS.BLOCKS, JSON.stringify(blocks)),

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
  
  getAlbums: (): GalleryAlbum[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.ALBUMS) || JSON.stringify(DEFAULT_ALBUMS)),
  saveAlbum: (album: GalleryAlbum) => {
      const albums = MockDb.getAlbums();
      const index = albums.findIndex(a => a.id === album.id);
      if (index >= 0) albums[index] = album; else albums.unshift(album);
      safeSetItem(STORAGE_KEYS.ALBUMS, JSON.stringify(albums));
  },
  deleteAlbum: (id: string) => {
      const albums = MockDb.getAlbums().filter(a => a.id !== id);
      safeSetItem(STORAGE_KEYS.ALBUMS, JSON.stringify(albums));
  },

  getGallery: () => JSON.parse(localStorage.getItem(STORAGE_KEYS.GALLERY) || JSON.stringify(DEFAULT_GALLERY)),
  saveImage: (img: any) => {
      const images = JSON.parse(localStorage.getItem(STORAGE_KEYS.GALLERY) || '[]');
      images.unshift(img);
      safeSetItem(STORAGE_KEYS.GALLERY, JSON.stringify(images));
  },
  deleteImage: (id: string) => {
      const images = JSON.parse(localStorage.getItem(STORAGE_KEYS.GALLERY) || '[]').filter((i:any) => i.id !== id);
      safeSetItem(STORAGE_KEYS.GALLERY, JSON.stringify(images));
  },

  getMenu: () => JSON.parse(localStorage.getItem(STORAGE_KEYS.MENU) || JSON.stringify(DEFAULT_MENU)),
  saveMenu: (items: any) => safeSetItem(STORAGE_KEYS.MENU, JSON.stringify(items)),

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

  // NEW HANDLERS FOR NEW MODULES
  getVideos: (): Video[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.VIDEOS) || JSON.stringify(DEFAULT_VIDEOS)),
  saveVideo: (video: Video) => {
      const list = MockDb.getVideos();
      const index = list.findIndex(v => v.id === video.id);
      if (index >= 0) list[index] = video; else list.push(video);
      safeSetItem(STORAGE_KEYS.VIDEOS, JSON.stringify(list));
  },
  deleteVideo: (id: string) => {
      const list = MockDb.getVideos().filter(v => v.id !== id);
      safeSetItem(STORAGE_KEYS.VIDEOS, JSON.stringify(list));
  },

  getIntroductions: (): IntroductionArticle[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.INTRO) || JSON.stringify(DEFAULT_INTRO)),
  saveIntroduction: (intro: IntroductionArticle) => {
      const list = MockDb.getIntroductions();
      const index = list.findIndex(i => i.id === intro.id);
      if (index >= 0) list[index] = intro; else list.push(intro);
      safeSetItem(STORAGE_KEYS.INTRO, JSON.stringify(list));
  },
  deleteIntroduction: (id: string) => {
      const list = MockDb.getIntroductions().filter(i => i.id !== id);
      safeSetItem(STORAGE_KEYS.INTRO, JSON.stringify(list));
  },

  getPostCategories: (): PostCategory[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.POST_CATS) || JSON.stringify(DEFAULT_POST_CATS)),
  savePostCategory: (cat: PostCategory) => {
      const list = MockDb.getPostCategories();
      const index = list.findIndex(c => c.id === cat.id);
      if (index >= 0) list[index] = cat; else list.push(cat);
      safeSetItem(STORAGE_KEYS.POST_CATS, JSON.stringify(list));
  },
  deletePostCategory: (id: string) => {
      const list = MockDb.getPostCategories().filter(c => c.id !== id);
      safeSetItem(STORAGE_KEYS.POST_CATS, JSON.stringify(list));
  }
};
