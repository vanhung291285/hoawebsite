
-- Kích hoạt extension UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Bảng Cấu hình trường học (Singleton)
CREATE TABLE IF NOT EXISTS school_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT,
  slogan TEXT,
  logo_url TEXT,
  favicon_url TEXT,
  banner_url TEXT,
  principal_name TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  hotline TEXT,
  map_url TEXT,
  facebook TEXT,
  youtube TEXT,
  zalo TEXT,
  website TEXT,
  show_welcome_banner BOOLEAN DEFAULT true,
  home_news_count INTEGER DEFAULT 6,
  home_show_program BOOLEAN DEFAULT true,
  primary_color TEXT DEFAULT '#1e3a8a',
  title_color TEXT DEFAULT '#fbbf24',
  title_shadow_color TEXT DEFAULT 'rgba(0,0,0,0.8)',
  meta_title TEXT,
  meta_description TEXT,
  footer_links JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert cấu hình mặc định
INSERT INTO school_config (name, slogan, address) 
VALUES ('Trường PTDTBT TH và THCS Suối Lư', 'Trách nhiệm - Yêu thương - Sáng tạo', 'Điện Biên')
ON CONFLICT DO NOTHING;

-- 2. Chuyên mục bài viết
CREATE TABLE IF NOT EXISTS post_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  color TEXT DEFAULT 'blue',
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO post_categories (name, slug, color, order_index) VALUES 
('Tin tức', 'news', 'blue', 1),
('Thông báo', 'announcement', 'red', 2),
('Hoạt động', 'activity', 'green', 3),
('Chuyên môn', 'professional', 'indigo', 4);

-- 3. Bài viết
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  summary TEXT,
  content TEXT,
  thumbnail TEXT,
  image_caption TEXT,
  author TEXT,
  date DATE DEFAULT CURRENT_DATE,
  category TEXT,
  views INTEGER DEFAULT 0,
  status TEXT DEFAULT 'published',
  is_featured BOOLEAN DEFAULT false,
  show_on_home BOOLEAN DEFAULT true,
  block_ids JSONB DEFAULT '[]',
  tags JSONB DEFAULT '[]',
  attachments JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Danh sách cán bộ
CREATE TABLE IF NOT EXISTS staff (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  position TEXT,
  party_date TEXT,
  email TEXT,
  avatar_url TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Danh mục tài liệu
CREATE TABLE IF NOT EXISTS document_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO document_categories (name, slug, description, order_index) VALUES
('Văn bản hành chính', 'official', 'Quyết định, thông báo chính thức', 1),
('Tài liệu học tập', 'resource', 'Đề cương, bài giảng', 2),
('Thời khóa biểu', 'timetable', 'Lịch học các khối lớp', 3);

-- 6. Tài liệu văn bản
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  number TEXT,
  title TEXT NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  category_id UUID REFERENCES document_categories(id),
  download_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Album ảnh
CREATE TABLE IF NOT EXISTS gallery_albums (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  thumbnail TEXT,
  created_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Hình ảnh trong album
CREATE TABLE IF NOT EXISTS gallery_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  url TEXT NOT NULL,
  caption TEXT,
  album_id UUID REFERENCES gallery_albums(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Người dùng (Quản trị viên)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'EDITOR',
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO users (username, password, full_name, role, email) 
VALUES ('admin', 'admin123', 'Quản trị viên', 'ADMIN', 'admin@school.edu.vn')
ON CONFLICT (username) DO NOTHING;

-- 10. Menu
CREATE TABLE IF NOT EXISTS menu_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  label TEXT NOT NULL,
  path TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO menu_items (label, path, order_index) VALUES
('Trang chủ', 'home', 1),
('Giới thiệu', 'intro', 2),
('Đội ngũ GV', 'staff', 3),
('Tin tức', 'news', 4),
('Văn bản', 'documents', 5),
('Thư viện', 'gallery', 6);

-- 11. Các khối hiển thị (Blocks)
CREATE TABLE IF NOT EXISTS display_blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  position TEXT NOT NULL, -- 'main' | 'sidebar'
  type TEXT NOT NULL, -- 'hero', 'grid', 'list', 'highlight', 'docs', 'html', 'stats', 'video'
  order_index INTEGER DEFAULT 0,
  item_count INTEGER DEFAULT 5,
  is_visible BOOLEAN DEFAULT true,
  target_page TEXT DEFAULT 'all',
  html_content TEXT,
  custom_color TEXT DEFAULT '#1e3a8a',
  custom_text_color TEXT DEFAULT '#1e3a8a',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO display_blocks (name, position, type, order_index, item_count, html_content) VALUES
('Slide Tin Nổi Bật', 'main', 'hero', 1, 3, 'featured'),
('Tin tức - Sự kiện', 'main', 'grid', 2, 6, 'news'),
('Hoạt động Ngoại khóa', 'main', 'highlight', 3, 4, 'activity'),
('TIN MỚI NHẤT', 'sidebar', 'list', 0, 10, 'all'),
('Thông báo mới', 'sidebar', 'list', 1, 5, 'announcement'),
('Tài liệu tải về', 'sidebar', 'docs', 2, 5, 'all'),
('Liên kết website', 'sidebar', 'html', 3, 1, '<ul class="space-y-2"><li class="border-b pb-1"><a href="#" class="text-blue-700 hover:underline">Bộ Giáo dục & Đào tạo</a></li><li class="border-b pb-1"><a href="#" class="text-blue-700 hover:underline">Sở GD&ĐT Điện Biên</a></li></ul>'),
('Thống kê truy cập', 'sidebar', 'stats', 4, 1, '');

-- 12. Bài viết giới thiệu
CREATE TABLE IF NOT EXISTS introductions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT,
  content TEXT,
  image_url TEXT,
  order_index INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Video
CREATE TABLE IF NOT EXISTS videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  youtube_url TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
