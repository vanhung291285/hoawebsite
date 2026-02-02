
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { Post, SchoolConfig, SchoolDocument, GalleryImage, GalleryAlbum, User, MenuItem, DisplayBlock, DocumentCategory, StaffMember, IntroductionArticle, PostCategory, Video } from '../types';
import { MockDb } from './mockDb';

// Initialize MockDb ONLY if Supabase is NOT configured.
// This prevents LocalStorage quota errors when the user intends to use Supabase.
if (!isSupabaseConfigured) {
  console.log("Supabase not configured, initializing Mock DB...");
  MockDb.init();
} else {
  console.log("Supabase configured, skipping Mock DB init.");
}

const ensureMockDb = () => {
    // Helper to ensure mock data is ready if we fallback
    MockDb.init();
};

export const DatabaseService = {
  // --- AUTH ---
  login: async (usernameOrEmail: string, password: string): Promise<User | null> => {
    // Luôn cắt khoảng trắng thừa
    const cleanInput = usernameOrEmail.trim();
    const cleanPass = password.trim();

    if (!isSupabaseConfigured) {
        ensureMockDb();
        return MockDb.login(cleanInput, cleanPass);
    }

    try {
        // Sử dụng .or để tìm kiếm theo username HOẶC email
        // QUAN TRỌNG: Bọc giá trị trong dấu ngoặc kép "..." để PostgREST xử lý đúng ký tự đặc biệt như @
        // Dùng ilike cho email để không phân biệt hoa thường
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .or(`username.eq."${cleanInput}",email.ilike."${cleanInput}"`)
          .eq('password', cleanPass)
          .maybeSingle(); 

        if (error) {
            console.warn("Supabase login error (falling back to mock):", error.message);
            // Mã lỗi PGRST116 nghĩa là trả về nhiều dòng hoặc không có dòng nào (khi dùng single), dùng maybeSingle đã xử lý việc này nhưng cứ giữ check.
            if (error.code === 'PGRST116') return null; 
            
            // Nếu lỗi kết nối, thử dùng mock
            ensureMockDb();
            return MockDb.login(cleanInput, cleanPass);
        }
        
        if (!data) return null;
        
        localStorage.setItem('vinaedu_session_user', JSON.stringify(data));
        return data as User;
    } catch (err) {
        console.error("Login exception:", err);
        ensureMockDb();
        return MockDb.login(cleanInput, cleanPass);
    }
  },

  logout: () => {
    localStorage.removeItem('vinaedu_session_user');
    MockDb.logout();
  },

  // --- ANALYTICS ---
  trackVisit: async () => {
    if (isSupabaseConfigured) {
        // Implement real tracking if needed
    }
    console.log("Visit tracked");
  },

  getVisitorStats: async () => {
    return MockDb.getVisitorStats();
  },

  // --- CONFIG ---
  getConfig: async (): Promise<SchoolConfig> => {
    if (!isSupabaseConfigured) {
        ensureMockDb();
        return MockDb.getConfig();
    }

    try {
        const { data, error } = await supabase.from('school_config').select('*').limit(1).single();
        if (error) throw error;
        return {
            ...data,
            logoUrl: data.logo_url,
            faviconUrl: data.favicon_url,
            bannerUrl: data.banner_url,
            principalName: data.principal_name,
            mapUrl: data.map_url,
            showWelcomeBanner: data.show_welcome_banner,
            homeNewsCount: data.home_news_count,
            homeShowProgram: data.home_show_program,
            primaryColor: data.primary_color,
            titleColor: data.title_color,
            titleShadowColor: data.title_shadow_color,
            metaTitle: data.meta_title,
            metaDescription: data.meta_description,
            footerLinks: data.footer_links || []
        };
    } catch (e) {
        console.warn("Using Mock Config due to error:", e);
        ensureMockDb();
        return MockDb.getConfig();
    }
  },

  saveConfig: async (config: SchoolConfig) => {
    if (!isSupabaseConfigured) {
        ensureMockDb();
        return MockDb.saveConfig(config);
    }

    const payload = {
        name: config.name,
        slogan: config.slogan,
        logo_url: config.logoUrl,
        favicon_url: config.faviconUrl,
        banner_url: config.bannerUrl,
        principal_name: config.principalName,
        address: config.address,
        phone: config.phone,
        email: config.email,
        hotline: config.hotline,
        map_url: config.mapUrl,
        facebook: config.facebook,
        youtube: config.youtube,
        zalo: config.zalo,
        website: config.website,
        show_welcome_banner: config.showWelcomeBanner,
        home_news_count: config.homeNewsCount,
        home_show_program: config.homeShowProgram,
        primary_color: config.primaryColor,
        title_color: config.titleColor,
        title_shadow_color: config.titleShadowColor,
        meta_title: config.metaTitle,
        meta_description: config.metaDescription,
        footer_links: config.footerLinks
    };

    const { data } = await supabase.from('school_config').select('id').limit(1);
    
    if (data && data.length > 0) {
      await supabase.from('school_config').update(payload).eq('id', data[0].id);
    } else {
      await supabase.from('school_config').insert([payload]);
    }
  },

  // --- POSTS ---
  getPosts: async (limitCount: number = 50): Promise<Post[]> => {
    if (!isSupabaseConfigured) {
        ensureMockDb();
        return MockDb.getPosts();
    }

    try {
        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(limitCount);
        
        if (error) throw error;
        return (data || []).map((p: any) => ({
            ...p,
            imageCaption: p.image_caption,
            isFeatured: p.is_featured,
            showOnHome: p.show_on_home,
            blockIds: p.block_ids,
            attachments: p.attachments || []
        }));
    } catch (e) {
        ensureMockDb();
        return MockDb.getPosts();
    }
  },

  savePost: async (post: Post) => {
    if (!isSupabaseConfigured) {
        ensureMockDb();
        return MockDb.savePost(post);
    }

    const payload = {
        title: post.title,
        slug: post.slug,
        summary: post.summary,
        content: post.content,
        thumbnail: post.thumbnail,
        image_caption: post.imageCaption,
        author: post.author,
        date: post.date,
        category: post.category,
        views: post.views,
        status: post.status,
        is_featured: post.isFeatured,
        show_on_home: post.showOnHome,
        block_ids: post.blockIds,
        tags: post.tags,
        attachments: post.attachments
    };

    if (post.id && post.id.length > 10 && !post.id.startsWith('mock')) {
       await supabase.from('posts').update(payload).eq('id', post.id);
    } else {
       await supabase.from('posts').insert([payload]);
    }
  },

  deletePost: async (id: string) => {
    if (!isSupabaseConfigured) {
        ensureMockDb();
        return MockDb.deletePost(id);
    }
    await supabase.from('posts').delete().eq('id', id);
  },

  // --- STAFF ---
  getStaff: async (): Promise<StaffMember[]> => {
    if (!isSupabaseConfigured) {
        ensureMockDb();
        return MockDb.getStaff();
    }

    try {
        const { data, error } = await supabase.from('staff').select('*').order('order_index', { ascending: true });
        if (error) throw error;
        return (data || []).map((s: any) => ({
            id: s.id,
            fullName: s.full_name,
            position: s.position,
            partyDate: s.party_date,
            email: s.email,
            avatarUrl: s.avatar_url,
            order: s.order_index
        }));
    } catch (e) {
        ensureMockDb();
        return MockDb.getStaff();
    }
  },
  
  saveStaff: async (staff: StaffMember) => {
    if (!isSupabaseConfigured) {
        ensureMockDb();
        return MockDb.saveStaff(staff);
    }

    const payload = {
        full_name: staff.fullName,
        position: staff.position,
        party_date: staff.partyDate,
        email: staff.email,
        avatar_url: staff.avatarUrl,
        order_index: staff.order
    };

    if (staff.id && staff.id.length > 5 && !staff.id.startsWith('mock')) {
        await supabase.from('staff').update(payload).eq('id', staff.id);
    } else {
        await supabase.from('staff').insert([payload]);
    }
  },

  deleteStaff: async (id: string) => {
    if (!isSupabaseConfigured) {
        ensureMockDb();
        return MockDb.deleteStaff(id);
    }
    await supabase.from('staff').delete().eq('id', id);
  },

  // --- DOCUMENTS ---
  getDocuments: async (): Promise<SchoolDocument[]> => {
    if (!isSupabaseConfigured) {
        ensureMockDb();
        return MockDb.getDocuments();
    }

    try {
        const { data, error } = await supabase.from('documents').select('*');
        if (error) throw error;
        return (data || []).map((d: any) => ({
            id: d.id,
            number: d.number,
            title: d.title,
            date: d.date,
            categoryId: d.category_id,
            downloadUrl: d.download_url
        }));
    } catch (e) {
        ensureMockDb();
        return MockDb.getDocuments();
    }
  },

  saveDocument: async (doc: SchoolDocument) => {
    if (!isSupabaseConfigured) {
        ensureMockDb();
        return MockDb.saveDocument(doc);
    }

    const payload = {
        number: doc.number,
        title: doc.title,
        date: doc.date,
        category_id: doc.categoryId,
        download_url: doc.downloadUrl
    };

    if (doc.id && doc.id.length > 5 && !doc.id.startsWith('mock')) {
        await supabase.from('documents').update(payload).eq('id', doc.id);
    } else {
        await supabase.from('documents').insert([payload]);
    }
  },

  deleteDocument: async (id: string) => {
      if (!isSupabaseConfigured) {
          ensureMockDb();
          return MockDb.deleteDocument(id);
      }
      await supabase.from('documents').delete().eq('id', id);
  },

  // --- GALLERY ---
  getAlbums: async (): Promise<GalleryAlbum[]> => {
    if (!isSupabaseConfigured) {
        ensureMockDb();
        return MockDb.getAlbums();
    }

    try {
        const { data, error } = await supabase.from('gallery_albums').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return (data || []).map((a: any) => ({
            id: a.id,
            title: a.title,
            description: a.description,
            thumbnail: a.thumbnail,
            createdDate: a.created_date || (a.created_at ? a.created_at.split('T')[0] : '')
        }));
    } catch (e) {
        ensureMockDb();
        return MockDb.getAlbums();
    }
  },

  saveAlbum: async (album: GalleryAlbum) => {
    if (!isSupabaseConfigured) {
        ensureMockDb();
        return MockDb.saveAlbum(album);
    }

    const payload = {
        title: album.title,
        description: album.description,
        thumbnail: album.thumbnail,
        created_date: album.createdDate
    };
    if (album.id && album.id.length > 5 && !album.id.startsWith('mock')) {
        await supabase.from('gallery_albums').update(payload).eq('id', album.id);
    } else {
        await supabase.from('gallery_albums').insert([payload]);
    }
  },

  deleteAlbum: async (id: string) => {
      if (!isSupabaseConfigured) {
          ensureMockDb();
          return MockDb.deleteAlbum(id);
      }
      await supabase.from('gallery_images').delete().eq('album_id', id);
      await supabase.from('gallery_albums').delete().eq('id', id);
  },

  getGallery: async (): Promise<GalleryImage[]> => {
     if (!isSupabaseConfigured) {
         ensureMockDb();
         return MockDb.getGallery();
     }

     try {
         const { data, error } = await supabase.from('gallery_images').select('*').order('created_at', { ascending: false });
         if (error) throw error;
         return (data || []).map((i: any) => ({
             id: i.id,
             url: i.url,
             caption: i.caption,
             albumId: i.album_id
         }));
     } catch (e) {
         ensureMockDb();
         return MockDb.getGallery();
     }
  },

  saveImage: async (image: GalleryImage) => {
    if (!isSupabaseConfigured) {
        ensureMockDb();
        return MockDb.saveImage(image);
    }

    const payload = {
        url: image.url,
        caption: image.caption,
        album_id: image.albumId
    };
    await supabase.from('gallery_images').insert([payload]);
  },

  deleteImage: async (id: string) => {
      if (!isSupabaseConfigured) {
          ensureMockDb();
          return MockDb.deleteImage(id);
      }
      await supabase.from('gallery_images').delete().eq('id', id);
  },

  // --- BLOCKS ---
  getBlocks: async (): Promise<DisplayBlock[]> => {
      if (!isSupabaseConfigured) {
          ensureMockDb();
          return MockDb.getBlocks();
      }

      try {
          const { data, error } = await supabase.from('display_blocks').select('*').order('order_index', { ascending: true });
          if (error) throw error;
          return (data || []).map((b: any) => ({
              id: b.id,
              name: b.name,
              position: b.position,
              type: b.type,
              order: b.order_index,
              itemCount: b.item_count,
              isVisible: b.is_visible,
              targetPage: b.target_page,
              htmlContent: b.html_content,
              customColor: b.custom_color,
              customTextColor: b.custom_text_color
          }));
      } catch (e) {
          ensureMockDb();
          return MockDb.getBlocks();
      }
  },

  saveBlock: async (block: DisplayBlock) => {
      if (!isSupabaseConfigured) {
          ensureMockDb();
          return MockDb.saveBlock(block);
      }

      const payload = {
          name: block.name,
          position: block.position,
          type: block.type,
          order_index: block.order,
          item_count: block.itemCount,
          is_visible: block.isVisible,
          target_page: block.targetPage,
          html_content: block.htmlContent,
          custom_color: block.customColor,
          custom_text_color: block.customTextColor
      };
      
      if (block.id && block.id.length > 10 && !block.id.startsWith('block_')) {
          await supabase.from('display_blocks').update(payload).eq('id', block.id);
      } else {
          await supabase.from('display_blocks').insert([payload]);
      }
  },

  deleteBlock: async (id: string) => {
      if (!isSupabaseConfigured) {
          ensureMockDb();
          return MockDb.deleteBlock(id);
      }
      await supabase.from('display_blocks').delete().eq('id', id);
  },

  saveBlocksOrder: async (blocks: DisplayBlock[]) => {
      if (!isSupabaseConfigured) {
          ensureMockDb();
          return MockDb.saveBlocksOrder(blocks);
      }
      for (const block of blocks) {
          await supabase.from('display_blocks').update({ order_index: block.order }).eq('id', block.id);
      }
  },

  // --- MENU ---
  getMenu: async (): Promise<MenuItem[]> => {
      if (!isSupabaseConfigured) {
          ensureMockDb();
          return MockDb.getMenu();
      }

      try {
          const { data, error } = await supabase.from('menu_items').select('*').order('order_index', { ascending: true });
          if (error) throw error;
          return (data || []).map((m: any) => ({
              id: m.id,
              label: m.label,
              path: m.path,
              order: m.order_index
          }));
      } catch (e) {
          ensureMockDb();
          return MockDb.getMenu();
      }
  },

  saveMenu: async (items: MenuItem[]) => {
      if (!isSupabaseConfigured) {
          ensureMockDb();
          return MockDb.saveMenu(items);
      }

      for (const item of items) {
          const payload = { label: item.label, path: item.path, order_index: item.order };
          if (item.id && item.id.length > 10 && !item.id.startsWith('menu_')) {
             await supabase.from('menu_items').update(payload).eq('id', item.id);
          } else {
             await supabase.from('menu_items').insert([payload]);
          }
      }
  },

  deleteMenu: async (id: string) => {
    if (!isSupabaseConfigured) return; 
    await supabase.from('menu_items').delete().eq('id', id);
  },

  // --- CATEGORIES ---
  getPostCategories: async (): Promise<PostCategory[]> => {
     if (!isSupabaseConfigured) return [];

     try {
         const { data, error } = await supabase.from('post_categories').select('*').order('order_index', { ascending: true });
         if (error) throw error;
         return (data || []).map((c: any) => ({ 
             id: c.id, 
             name: c.name, 
             slug: c.slug, 
             color: c.color, 
             order: c.order_index 
         }));
     } catch (e) {
         return [];
     }
  },

  savePostCategory: async (cat: PostCategory) => {
    if (!isSupabaseConfigured) return;

    const payload = { name: cat.name, slug: cat.slug, color: cat.color, order_index: cat.order };
    if (cat.id && cat.id.length > 10) {
        await supabase.from('post_categories').update(payload).eq('id', cat.id);
    } else {
        await supabase.from('post_categories').insert([payload]);
    }
  },

  deletePostCategory: async (id: string) => {
    if (!isSupabaseConfigured) return;
    await supabase.from('post_categories').delete().eq('id', id);
  },

  // --- DOC CATEGORIES ---
  getDocCategories: async (): Promise<DocumentCategory[]> => {
    if (!isSupabaseConfigured) {
        ensureMockDb();
        return MockDb.getDocCategories();
    }

    try {
        const { data, error } = await supabase.from('document_categories').select('*').order('order_index', { ascending: true });
        if (error) throw error;
        return (data || []).map((c: any) => ({ 
            id: c.id, 
            name: c.name, 
            slug: c.slug, 
            description: c.description, 
            order: c.order_index 
        }));
    } catch (e) {
        ensureMockDb();
        return MockDb.getDocCategories();
    }
  },

  saveDocCategory: async (cat: DocumentCategory) => {
    if (!isSupabaseConfigured) {
        ensureMockDb();
        return MockDb.saveDocCategory(cat);
    }

    const payload = { name: cat.name, slug: cat.slug, description: cat.description, order_index: cat.order };
    if (cat.id && cat.id.length > 10) {
        await supabase.from('document_categories').update(payload).eq('id', cat.id);
    } else {
        await supabase.from('document_categories').insert([payload]);
    }
  },

  deleteDocCategory: async (id: string) => {
      if (!isSupabaseConfigured) {
          ensureMockDb();
          return MockDb.deleteDocCategory(id);
      }
      await supabase.from('document_categories').delete().eq('id', id);
  },

  saveDocCategoriesOrder: async (categories: DocumentCategory[]) => {
      if (!isSupabaseConfigured) return;
      for (const cat of categories) {
          await supabase.from('document_categories').update({ order_index: cat.order }).eq('id', cat.id);
      }
  },

  // --- VIDEOS ---
  getVideos: async (): Promise<Video[]> => {
    if (!isSupabaseConfigured) return [];

    try {
        const { data, error } = await supabase.from('videos').select('*').order('order_index', { ascending: true });
        if (error) throw error;
        return (data || []).map((v: any) => ({
            id: v.id,
            title: v.title,
            youtubeUrl: v.youtube_url,
            order: v.order_index
        }));
    } catch (e) {
        return [];
    }
  },

  saveVideo: async (video: Video) => {
    if (!isSupabaseConfigured) return;

    const payload = { title: video.title, youtube_url: video.youtubeUrl, order_index: video.order };
    if (video.id && video.id.length > 5) {
        await supabase.from('videos').update(payload).eq('id', video.id);
    } else {
        await supabase.from('videos').insert([payload]);
    }
  },

  deleteVideo: async (id: string) => {
    if (!isSupabaseConfigured) return;
    await supabase.from('videos').delete().eq('id', id);
  },

  // --- INTRO ---
  getIntroductions: async (): Promise<IntroductionArticle[]> => {
    if (!isSupabaseConfigured) return [];

    try {
        const { data, error } = await supabase.from('introductions').select('*').order('order_index', { ascending: true });
        if (error) throw error;
        return (data || []).map((i: any) => ({
            id: i.id,
            title: i.title,
            slug: i.slug,
            content: i.content,
            imageUrl: i.image_url,
            order: i.order_index,
            isVisible: i.is_visible
        }));
    } catch (e) {
        return [];
    }
  },

  saveIntroduction: async (intro: IntroductionArticle) => {
    if (!isSupabaseConfigured) return;

    const payload = {
        title: intro.title,
        slug: intro.slug,
        content: intro.content,
        image_url: intro.imageUrl,
        order_index: intro.order,
        is_visible: intro.isVisible
    };
    if (intro.id && intro.id.length > 5) {
        await supabase.from('introductions').update(payload).eq('id', intro.id);
    } else {
        await supabase.from('introductions').insert([payload]);
    }
  },

  deleteIntroduction: async (id: string) => {
    if (!isSupabaseConfigured) return;
    await supabase.from('introductions').delete().eq('id', id);
  },

  // --- USERS ---
  getUsers: async (): Promise<User[]> => {
    if (!isSupabaseConfigured) {
        ensureMockDb();
        return MockDb.getUsers();
    }

    try {
        const { data, error } = await supabase.from('users').select('*');
        if (error) throw error;
        return (data || []).map((u: any) => ({
            id: u.id,
            username: u.username,
            fullName: u.full_name,
            role: u.role,
            email: u.email
        }));
    } catch (e) {
        ensureMockDb();
        return MockDb.getUsers();
    }
  },

  saveUser: async (user: User) => {
    if (!isSupabaseConfigured) {
        ensureMockDb();
        return MockDb.saveUser(user);
    }

    const payload = {
        username: user.username,
        password: user.password,
        full_name: user.fullName,
        role: user.role,
        email: user.email
    };
    
    const { data } = await supabase.from('users').select('id').eq('username', user.username).single();
    if (data) {
        await supabase.from('users').update(payload).eq('id', data.id);
    } else {
        await supabase.from('users').insert([payload]);
    }
  },

  deleteUser: async (id: string) => {
      if (!isSupabaseConfigured) {
          ensureMockDb();
          return MockDb.deleteUser(id);
      }
      await supabase.from('users').delete().eq('id', id);
  },
};
