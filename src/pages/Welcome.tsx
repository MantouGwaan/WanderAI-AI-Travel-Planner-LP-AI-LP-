
import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import './Landing.css'; // We will create this

export default function Welcome() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const recentTrips = useAppStore(state => state.recentTrips);
  const loadTrip = useAppStore(state => state.loadTrip);
  const deleteTrip = useAppStore(state => state.deleteTrip);

  useEffect(() => {
    if (!containerRef.current) return;

    // Attach click listeners to CTA buttons
    const ctaButtons = ["nav-cta", "hero-cta", "footer-cta"];
    ctaButtons.forEach(id => {
      const btn = containerRef.current?.querySelector(`#${id}`);
      if (btn) {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          useAppStore.getState().resetJourney();
          navigate('/preferences');
        });
      }
    });

    // Smooth scroll for anchor links
    const anchorLinks = containerRef.current?.querySelectorAll('a[href^="#"]');
    anchorLinks?.forEach(link => {
      const href = link.getAttribute('href');
      // Only intercept internal page anchors, not React Router hash links
      if (href && href.startsWith('#') && !href.startsWith('#/')) {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          const targetId = href.substring(1);
          if (targetId) {
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
              targetElement.scrollIntoView({ behavior: 'smooth' });
            }
          }
        });
      }
    });

    // The rest of the script logic
    
      
        const demoStates = Array.from(document.querySelectorAll(".demo-state"));
        const demoDots = Array.from(document.querySelectorAll(".demo-dot"));
        const demoTrack = document.getElementById("demo-track");
        const demoStage = document.getElementById("demo-stage");
        const demoScrollThumb = document.getElementById("demo-scroll-thumb");
        const langToggle = document.getElementById("lang-toggle");
        const demoTitle = document.getElementById("demo-title");
        const demoIndex = document.getElementById("demo-index");
        const demoMiniLabel = document.getElementById("demo-mini-label");
        const demoCaption = document.getElementById("demo-caption");
        const demoProgress = document.getElementById("demo-progress");

        const translations = {
          en: {
            nav_features: "Features",
            nav_flow: "Flow",
            nav_archive: "Archive",
            nav_contact: "Contact",
            nav_open_app: "Open App",
            hero_badge: "AI Travel Planner",
            hero_title: "Plan your trip<span class=\"block\">in one calm flow.</span>",
            hero_copy: "Choose your destination, set your interests, adjust the time, and turn it into a real itinerary you can continue using.",
            hero_start: "Start Planning",
            hero_see_features: "See Features",
            hero_chip_destination: "Destination",
            hero_chip_interests: "Interests",
            hero_chip_time: "Time",
            hero_chip_itinerary: "Itinerary",
            preview_badge: "Product Preview",
            preview_copy: "The preview follows the same logic as the real app: set the trip, shape preferences, adjust timing, then refine the itinerary.",
            features_label: "Features",
            features_title: "A clearer product story, built around the real experience.",
            features_copy: "WanderAI does more than generate a single result. It lets users define the trip, browse recommendations, freely choose attractions, and keep refining the itinerary afterward.",
            attraction_label: "Attraction Selection",
            attraction_title: "Freely choose the places you want in the trip.",
            attraction_copy: "The app recommends attractions based on destination and preferences, but the final selection still belongs to the user. This makes the experience feel curated, not forced.",
            attraction_bullet_1: "Browse recommendation cards with category, rating, short descriptions, and quick add actions.",
            attraction_bullet_2: "Filter by interest and compare options before deciding what should enter the itinerary.",
            attraction_bullet_3: "Generate the itinerary only after enough attractions have been selected, which keeps the plan user-led.",
            selection_status_label: "Selection Status",
            selection_status_value: "2 attractions selected",
            selection_status_cta: "Generate itinerary",
            feature_card_1_title: "Trip setup",
            feature_card_1_copy: "Start with destinations, trip length, budget, dining style, transport preferences, and personal interests.",
            feature_card_2_title: "AI itinerary editing",
            feature_card_2_copy: "After generation, the workbench allows users to adjust timing, move activities, and request changes with AI assistance.",
            feature_card_3_title: "Booking and export",
            feature_card_3_copy: "When the plan is ready, users can continue into booking references and export a PDF version of the itinerary.",
            flow_label: "Flow",
            flow_title: "How the trip comes together inside WanderAI.",
            flow_copy: "The homepage stays concise, but the actual product flow is deeper. Users move from setup to attraction curation, then into itinerary refinement and final export.",
            flow_card_1_title: "Input",
            flow_card_1_copy: "Users start by entering destinations, budget, duration, transport, and travel preferences.",
            flow_card_2_title: "Explore",
            flow_card_2_copy: "Recommended attractions are presented as cards so users can filter, compare, and freely select what they want.",
            flow_card_3_title: "Refine",
            flow_card_3_copy: "The itinerary workbench turns those selections into a schedule that can still be edited, reordered, or adjusted with AI.",
            flow_card_4_title: "Output",
            flow_card_4_copy: "Users continue to booking guidance and generate a PDF itinerary when the trip feels complete.",
            start_label: "Start",
            start_title: "Ready to explore the world?",
            start_copy: "Cleaner first impression, clearer product story, same real experience underneath.",
            start_cta: "Launch WanderAI",
            archive_title: "Your Archives",
            archive_subtitle: "Pick up right where you left off.",
            archive_card_title: "Trip to Foshan, Guan...",
            archive_card_days: "3 Days",
            archive_card_date: "2026/3/28",
            archive_card_cta: "Continue Planning",
            footer_brand_tag: "AI Travel Planner",
            footer_brand_line_1: "Plan with less friction.",
            footer_brand_line_2: "Choose what matters.",
            footer_brand_line_3: "Refine until the trip feels right.",
            footer_product_heading: "Product",
            footer_product_link_1: "How It Works",
            footer_product_link_2: "Attraction Selection",
            footer_product_link_3: "Itinerary Editing",
            footer_product_link_4: "Open App",
            footer_contact_heading: "Contact",
            footer_contact_link_1: "Book a Free Demo",
            footer_contact_link_2: "Get a Quote",
            footer_contact_link_3: "Request a Demo",
            footer_bottom_copy: "© 2026 WanderAI. All rights reserved.",
            footer_bottom_location: "Made in Singapore",
          },
          zh: {
            nav_features: "功能",
            nav_flow: "流程",
            nav_archive: "历史",
            nav_contact: "联系",
            nav_open_app: "进入应用",
            hero_badge: "AI 旅行规划助手",
            hero_title: "用更清晰的方式<span class=\"block\">开始规划旅程。</span>",
            hero_copy: "先选择目的地，再设置兴趣和时间，最后生成一个可以继续编辑和使用的真实行程。",
            hero_start: "开始规划",
            hero_see_features: "查看功能",
            hero_chip_destination: "目的地",
            hero_chip_interests: "兴趣偏好",
            hero_chip_time: "时间安排",
            hero_chip_itinerary: "行程结果",
            preview_badge: "产品预览",
            preview_copy: "这个预览遵循真实应用的逻辑：先设定旅行，再调整偏好和时间，最后进入行程编辑。",
            features_label: "功能亮点",
            features_title: "更清晰地介绍产品，也更贴近真实体验。",
            features_copy: "WanderAI 不只是生成一次结果，它允许用户先定义旅行，再浏览推荐，自由选择景点，之后继续细化行程。",
            attraction_label: "景点选择",
            attraction_title: "用户可以自由挑选想加入行程的景点。",
            attraction_copy: "系统会根据目的地和偏好给出推荐，但最终保留哪些景点，仍然由用户自己决定，这也是体验中的关键亮点。",
            attraction_bullet_1: "用卡片形式展示景点类别、评分、简介和快速加入操作。",
            attraction_bullet_2: "可以按兴趣筛选并对比，再决定哪些景点真正进入行程。",
            attraction_bullet_3: "只有在景点选择完成后才生成行程，整个流程会更符合用户主导的使用方式。",
            selection_status_label: "已选状态",
            selection_status_value: "已选择 2 个景点",
            selection_status_cta: "生成行程",
            feature_card_1_title: "旅行设定",
            feature_card_1_copy: "先输入目的地、旅行时长、预算、餐饮偏好、交通方式和个人兴趣。",
            feature_card_2_title: "AI 行程微调",
            feature_card_2_copy: "生成之后，工作台还能继续调整时间、移动活动顺序，并通过 AI 帮助修改安排。",
            feature_card_3_title: "预订与导出",
            feature_card_3_copy: "当行程准备好之后，用户可以继续查看预订参考，并导出 PDF 版本。",
            flow_label: "使用流程",
            flow_title: "一段完整旅行是怎样在 WanderAI 里形成的。",
            flow_copy: "首页保持简洁，但真实产品流程更完整。用户会从旅行设定进入景点选择，再到行程细化和最终导出。",
            flow_card_1_title: "输入设定",
            flow_card_1_copy: "用户先填写目的地、预算、时长、交通方式和旅行偏好。",
            flow_card_2_title: "浏览选择",
            flow_card_2_copy: "推荐景点会以卡片形式呈现，用户可以筛选、比较，并自由选择想保留的内容。",
            flow_card_3_title: "继续细化",
            flow_card_3_copy: "工作台会把这些选择变成可继续编辑、重排和 AI 调整的完整日程。",
            flow_card_4_title: "输出结果",
            flow_card_4_copy: "当旅行计划成熟后，用户可以进入预订参考并生成 PDF 行程。",
            start_label: "开始体验",
            start_title: "准备好探索世界了吗？",
            start_copy: "更好的首页第一印象，更清楚的产品说明，但底层仍然连接真实体验。",
            start_cta: "进入 WanderAI",
            archive_title: "您的归档",
            archive_subtitle: "从您上次离开的地方继续。",
            archive_card_title: "佛山之旅，广东...",
            archive_card_days: "3 天",
            archive_card_date: "2026/3/28",
            archive_card_cta: "继续规划",
            footer_brand_tag: "AI 旅行规划助手",
            footer_brand_line_1: "更轻松地开始规划。",
            footer_brand_line_2: "自由选择真正想去的地方。",
            footer_brand_line_3: "不断微调，直到行程合适为止。",
            footer_product_heading: "产品",
            footer_product_link_1: "使用流程",
            footer_product_link_2: "景点选择",
            footer_product_link_3: "行程编辑",
            footer_product_link_4: "进入应用",
            footer_contact_heading: "联系",
            footer_contact_link_1: "预约免费演示",
            footer_contact_link_2: "获取报价",
            footer_contact_link_3: "申请演示",
            footer_bottom_copy: "© 2026 WanderAI. 保留所有权利。",
            footer_bottom_location: "制作于新加坡",
          },
        };

        const demoMeta = {
          en: [
            {
              title: "Choose destination",
              caption: "Start with city, budget, and trip style.",
            },
            {
              title: "Select interests",
              caption: "Choose the interests that should shape the recommendations.",
            },
            {
              title: "Adjust time",
              caption: "Tune duration before generating the plan.",
            },
            {
              title: "Refine itinerary",
              caption: "Edit the schedule, then continue to booking links and PDF.",
            },
          ],
          zh: [
            {
              title: "选择目的地",
              caption: "先确定城市、预算和旅行风格。",
            },
            {
              title: "设置兴趣",
              caption: "用兴趣偏好决定推荐内容的方向。",
            },
            {
              title: "调整时间",
              caption: "在生成之前先把时长调到合适。",
            },
            {
              title: "细化行程",
              caption: "进入行程编辑，再继续到预订参考和 PDF 导出。",
            },
          ],
        };

        ctaButtons.forEach(function (id) {
          const btn = document.getElementById(id);
          if (!btn) return;

          btn.addEventListener("click", function () {
            if (typeof (window as any).gtag === "function") {
              (window as any).gtag("event", "click_start_free_trial", {
                button_id: id,
                page_location: window.location.href,
              });
            }

            if (typeof (window as any).clarity === "function") {
              (window as any).clarity("event", "click_start_free_trial");
            }
          });
        });

        let currentStep = 0;
        let demoTimer = null;
        let currentLang = "en";

        function applyTranslations() {
          document.querySelectorAll("[data-i18n]").forEach(function (el) {
            const key = el.getAttribute("data-i18n");
            if (!key) return;
            el.textContent = translations[currentLang][key];
          });

          document.querySelectorAll("[data-i18n-html]").forEach(function (el) {
            const key = el.getAttribute("data-i18n-html");
            if (!key) return;
            el.innerHTML = translations[currentLang][key];
          });

          if (langToggle) {
            langToggle.textContent = currentLang === "en" ? "中文" : "EN";
          }

          renderDemo(currentStep);
        }

        function renderDemo(step) {
          currentStep = step;

          demoStates.forEach(function (state, index) {
            state.classList.toggle("is-active", index === step);
          });

          demoDots.forEach(function (dot, index) {
            const active = index === step;
            dot.classList.toggle("is-active", active);
            dot.classList.toggle("bg-pine/90", active);
            dot.classList.toggle("bg-pine/25", !active);
          });

          const meta = demoMeta[currentLang][step];
          if (demoTitle) demoTitle.textContent = meta.title;
          if (demoCaption) demoCaption.textContent = meta.caption;
          if (demoMiniLabel) {
            demoMiniLabel.textContent =
              currentLang === "en" ? "Step 0" + (step + 1) : "步骤 0" + (step + 1);
          }
          if (demoIndex) demoIndex.textContent = "0" + (step + 1) + "/04";
          if (demoProgress) demoProgress.style.width = ((step + 1) / demoMeta[currentLang].length) * 100 + "%";
          if (demoTrack) {
            demoTrack.style.transform = "translate3d(0, -" + step * 25 + "%, 0)";
          }
          if (demoScrollThumb) {
            demoScrollThumb.style.transform = "translateY(" + step * 105 + "%)";
          }
        }

        function startDemoLoop() {
          if (demoTimer) clearInterval(demoTimer);
          demoTimer = setInterval(function () {
            renderDemo((currentStep + 1) % demoMeta[currentLang].length);
          }, 2600);
        }

        demoDots.forEach(function (dot) {
          dot.addEventListener("click", function () {
            const step = Number(dot.getAttribute("data-dot"));
            renderDemo(step);
            startDemoLoop();
          });
        });

        if (langToggle) {
          langToggle.addEventListener("click", function () {
            currentLang = currentLang === "en" ? "zh" : "en";
            applyTranslations();
          });
        }

        applyTranslations();
        renderDemo(0);
        startDemoLoop();

        window.addEventListener("resize", function () {
          renderDemo(currentStep);
        });

        const observer = new IntersectionObserver(
          function (entries) {
            entries.forEach(function (entry) {
              if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
              }
            });
          },
          {
            threshold: 0.16,
          },
        );

        document.querySelectorAll(".section-fade").forEach(function (el) {
          observer.observe(el);
        });

    return () => {
      // Cleanup if necessary
      if (demoTimer) clearInterval(demoTimer);
    };
  }, [navigate]);

  useEffect(() => {
    if (!containerRef.current) return;
    
    const loadBtns = containerRef.current.querySelectorAll('.archive-card-load');
    const deleteBtns = containerRef.current.querySelectorAll('.archive-card-delete');
    
    const handleLoad = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      const tripId = (e.currentTarget as HTMLElement).getAttribute('data-trip-id');
      if (tripId) {
        loadTrip(tripId);
        const trip = recentTrips.find(t => t.id === tripId);
        if (trip) {
          if (trip.unlockedSections?.bookings) {
            navigate('/checkout');
          } else if (trip.unlockedSections?.itinerary) {
            navigate('/workbench');
          } else if (trip.unlockedSections?.explore) {
            navigate('/attractions');
          } else {
            navigate('/preferences');
          }
        } else {
          navigate('/preferences');
        }
      }
    };
    
    const handleDelete = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      const tripId = (e.currentTarget as HTMLElement).getAttribute('data-trip-id');
      if (tripId) {
        deleteTrip(tripId);
      }
    };
    
    loadBtns.forEach(btn => btn.addEventListener('click', handleLoad));
    deleteBtns.forEach(btn => btn.addEventListener('click', handleDelete));
    
    return () => {
      loadBtns.forEach(btn => btn.removeEventListener('click', handleLoad));
      deleteBtns.forEach(btn => btn.removeEventListener('click', handleDelete));
    };
  }, [recentTrips, loadTrip, deleteTrip, navigate]);

  const archiveCardsHtml = recentTrips.map(trip => {
    const tripDays = trip.itinerary?.length || trip.preferences?.duration || 0;
    const dateStr = new Date(trip.timestamp).toLocaleDateString();
    return `
      <div class="group relative flex flex-col overflow-hidden rounded-3xl bg-white shadow-md transition-all hover:shadow-lg border border-slate-100">
        <div class="relative h-64 w-full overflow-hidden cursor-pointer archive-card-load" data-trip-id="${trip.id}">
          <img src="${trip.thumbnail || 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?q=80&w=2070&auto=format&fit=crop'}" alt="${trip.name}" class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
          <button class="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition-colors hover:bg-white/40 archive-card-delete" data-trip-id="${trip.id}">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
          </button>
          <div class="absolute bottom-4 left-4 right-4 text-white pointer-events-none">
            <h3 class="truncate text-2xl font-bold">${trip.name}</h3>
            <div class="mt-2 flex items-center gap-4 text-sm font-medium text-white/90">
              <div class="flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect><line x1="16" x2="16" y1="2" y2="6"></line><line x1="8" x2="8" y1="2" y2="6"></line><line x1="3" x2="21" y1="10" y2="10"></line></svg>
                <span>${tripDays} Days</span>
              </div>
              <div class="flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                <span>${dateStr}</span>
              </div>
            </div>
          </div>
        </div>
        <button class="flex items-center justify-between bg-white p-5 archive-card-load w-full text-left" data-trip-id="${trip.id}">
          <span class="font-bold text-[#047857]" data-i18n="archive_card_cta">Continue Planning</span>
          <div class="flex h-10 w-10 items-center justify-center rounded-full bg-[#047857] text-white transition-transform group-hover:translate-x-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
          </div>
        </button>
      </div>
    `;
  }).join('');

  const archiveSectionHtml = recentTrips.length > 0 ? `
      <section id="archive" class="scroll-mt-24 px-4 py-16 sm:px-6 lg:px-10">
        <div class="mx-auto max-w-7xl">
          <div class="section-fade">
            <h2 class="text-3xl font-extrabold text-slate-900 sm:text-4xl" data-i18n="archive_title">
              Your Archives
            </h2>
            <p class="mt-2 text-lg text-slate-600" data-i18n="archive_subtitle">
              Pick up right where you left off.
            </p>
            <hr class="my-8 border-slate-200" />
            <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              ${archiveCardsHtml}
            </div>
          </div>
        </div>
      </section>
  ` : '';

  return (
    <div 
      className="landing-page overflow-x-hidden"
      ref={containerRef}
      dangerouslySetInnerHTML={{ __html: `
    <div class="pointer-events-none fixed inset-0 -z-10 hero-mesh opacity-30"></div>

    <nav class="fixed top-0 left-0 right-0 z-50 px-4 pt-5 sm:px-6 lg:px-10">
      <div class="glass mx-auto flex max-w-7xl items-center justify-between rounded-full border border-white/80 px-5 py-3 shadow-soft sm:px-7">
        <a href="#top" class="flex items-center gap-3 text-pine">
          <span class="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="9"></circle>
              <path d="m15.5 8.5-5 7L9 12l6.5-3.5Z"></path>
            </svg>
          </span>
          <span class="text-lg font-extrabold tracking-tight">WanderAI</span>
        </a>

        <div class="hidden items-center gap-7 text-sm font-semibold text-slate-700 md:flex">
          <a href="#features" class="transition-colors hover:text-pine" data-i18n="nav_features">Features</a>
          <a href="#flow" class="transition-colors hover:text-pine" data-i18n="nav_flow">Flow</a>
          ${recentTrips.length > 0 ? `<a href="#archive" class="transition-colors hover:text-pine" data-i18n="nav_archive">Archive</a>` : ''}
          <a href="#contact" class="transition-colors hover:text-pine" data-i18n="nav_contact">Contact</a>
        </div>

        <div class="flex items-center gap-2">
          <button
            id="lang-toggle"
            type="button"
            class="rounded-full border border-white/80 bg-white/72 px-4 py-2.5 text-sm font-bold text-pine transition-all hover:-translate-y-0.5 hover:bg-white"
          >
            中文
          </button>
          <a
            href="#/preferences"
            id="nav-cta"
            class="rounded-full bg-pine px-5 py-2.5 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-emerald"
            data-i18n="nav_open_app"
          >
            Open App
          </a>
        </div>
      </div>
    </nav>

    <main id="top" class="pt-24 lg:pt-28">
      <section class="px-4 pb-16 pt-4 sm:px-6 lg:px-10 lg:pb-24 lg:pt-8">
        <div class="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[0.88fr_1.12fr]">
          <div class="section-fade">
            <div class="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/64 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.24em] text-slate-700 shadow-sm" data-i18n="hero_badge">
              AI Travel Planner
            </div>

            <h1 class="mt-6 max-w-3xl text-5xl font-extrabold leading-[1.02] tracking-tight text-pine sm:text-6xl lg:text-7xl" data-i18n-html="hero_title">
              Plan your trip
              <span class="block">in one calm flow.</span>
            </h1>

            <p class="mt-6 max-w-xl text-lg leading-8 text-slate-600" data-i18n="hero_copy">
              Choose your destination, set your interests, adjust the time, and turn it into a real itinerary you can continue using.
            </p>

            <div class="mt-8 flex flex-col gap-4 sm:flex-row">
              <a
                href="#/preferences"
                id="hero-cta"
                class="inline-flex items-center justify-center gap-2 rounded-full bg-pine px-7 py-4 text-base font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-emerald"
              >
                <span data-i18n="hero_start">Start Planning</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
              </a>
              <a
                href="#features"
                class="inline-flex items-center justify-center rounded-full border border-white/80 bg-white/66 px-7 py-4 text-base font-semibold text-slate-800 transition-all hover:bg-white/80"
                data-i18n="hero_see_features"
              >
                See Features
              </a>
            </div>

            <div class="mt-10 flex flex-wrap gap-3 text-sm font-semibold text-slate-700">
              <span class="rounded-full bg-white/72 px-4 py-2 shadow-sm" data-i18n="hero_chip_destination">Destination</span>
              <span class="rounded-full bg-white/72 px-4 py-2 shadow-sm" data-i18n="hero_chip_interests">Interests</span>
              <span class="rounded-full bg-white/72 px-4 py-2 shadow-sm" data-i18n="hero_chip_time">Time</span>
              <span class="rounded-full bg-white/72 px-4 py-2 shadow-sm" data-i18n="hero_chip_itinerary">Itinerary</span>
            </div>
          </div>

          <div class="section-fade">
            <div class="relative mx-auto flex max-w-4xl flex-col items-center gap-5 lg:items-end">
              <div class="glass inline-flex items-center gap-2 rounded-full border border-white/80 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.24em] text-slate-700 shadow-sm">
                <span class="h-2 w-2 rounded-full bg-emerald"></span>
                <span data-i18n="preview_badge">Product Preview</span>
              </div>

              <div class="phone-shell">
                <div class="phone-screen">
                  <div class="flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                    <span>9:41</span>
                    <div class="flex items-center gap-1.5">
                      <span class="h-2 w-2 rounded-full bg-slate-400/70"></span>
                      <span class="h-2 w-2 rounded-full bg-slate-400/70"></span>
                      <span class="h-2 w-2 rounded-full bg-slate-400/70"></span>
                    </div>
                  </div>

                  <div class="mt-4 rounded-[24px] bg-white/88 p-4 shadow-sm">
                    <div class="flex items-start justify-between gap-4">
                      <div>
                        <p class="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-500" id="demo-mini-label">Step 01</p>
                        <h2 class="mt-1 text-xl font-extrabold text-pine" id="demo-title">Choose destination</h2>
                      </div>
                      <div class="rounded-full bg-sage px-3 py-2 text-xs font-bold text-pine shadow-sm" id="demo-index">01/04</div>
                    </div>
                    <p class="demo-caption mt-3 text-sm leading-6 text-slate-600" id="demo-caption">
                      Start with city, budget, and trip style.
                    </p>
                    <div class="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div id="demo-progress" class="h-full rounded-full bg-emerald transition-all duration-500" style="width: 25%"></div>
                    </div>
                  </div>

                  <div class="demo-stage" id="demo-stage">
                    <div class="demo-track" id="demo-track">
                      <div class="demo-state is-active" data-step="0">
                      <div class="rounded-[26px] bg-[linear-gradient(160deg,#d9f0de,#f7faf6)] p-5 shadow-sm">
                        <div class="flex items-center justify-between">
                          <p class="text-sm font-bold text-pine">Trip Planner</p>
                          <span class="rounded-full bg-white/80 px-3 py-1 text-[11px] font-bold text-slate-500">Preferences</span>
                        </div>
                        <div class="mt-4 rounded-2xl bg-white/86 p-4 shadow-sm">
                          <p class="text-xs text-slate-500">Destinations</p>
                          <p class="mt-1 text-base font-bold text-pine">Tokyo, Kyoto</p>
                          <div class="mt-3 flex gap-2 text-xs font-semibold">
                            <span class="rounded-full bg-sage px-3 py-1.5 text-pine">Tokyo</span>
                            <span class="rounded-full bg-sage px-3 py-1.5 text-pine">Kyoto</span>
                          </div>
                        </div>
                        <div class="mt-3 grid grid-cols-2 gap-3">
                          <div class="rounded-2xl bg-white/86 p-4 shadow-sm">
                            <p class="text-xs text-slate-500">Budget</p>
                            <p class="mt-1 font-bold text-pine">Mid-range</p>
                          </div>
                          <div class="rounded-2xl bg-white/86 p-4 shadow-sm">
                            <p class="text-xs text-slate-500">Transport</p>
                            <p class="mt-1 font-bold text-pine">Transit</p>
                          </div>
                        </div>
                      </div>
                      <div class="mt-4 rounded-[24px] bg-white/88 p-4 shadow-sm">
                        <p class="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">Travel Style</p>
                        <div class="mt-3 flex flex-wrap gap-2 text-sm font-semibold">
                          <span class="rounded-full bg-sage px-3 py-2 text-pine">Food</span>
                          <span class="rounded-full bg-sage px-3 py-2 text-pine">Culture</span>
                          <span class="rounded-full bg-white px-3 py-2 text-slate-600 ring-1 ring-slate-100">History</span>
                        </div>
                      </div>
                    </div>

                    <div class="demo-state" data-step="1">
                      <div class="rounded-[26px] bg-[linear-gradient(160deg,#edf8ef,#f8faf6)] p-5 shadow-sm">
                        <div class="flex items-center justify-between">
                          <p class="text-sm font-bold text-pine">Preferences</p>
                          <span class="rounded-full bg-white/80 px-3 py-1 text-[11px] font-bold text-slate-500">Interests</span>
                        </div>
                        <p class="mt-2 text-sm text-slate-600">Match the trip to your style.</p>
                        <div class="mt-5 flex flex-wrap gap-3">
                          <span class="interest-chip is-selected rounded-full px-4 py-2 text-sm font-semibold">Local Food</span>
                          <span class="interest-chip is-selected rounded-full px-4 py-2 text-sm font-semibold">Culture</span>
                          <span class="interest-chip rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm">Nature</span>
                          <span class="interest-chip rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm">Photography</span>
                          <span class="interest-chip rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm">Shopping</span>
                          <span class="interest-chip rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm">Nightlife</span>
                        </div>
                      </div>
                      <div class="mt-4 rounded-[24px] bg-white/88 p-4 shadow-sm">
                        <p class="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">Recommendation Focus</p>
                        <div class="mt-3 space-y-3">
                          <div class="rounded-2xl bg-sage/70 p-3 text-sm font-semibold text-pine">Food markets and local restaurants</div>
                          <div class="rounded-2xl bg-white p-3 text-sm font-semibold text-slate-700 shadow-sm">Historic streets and temples</div>
                        </div>
                      </div>
                    </div>

                    <div class="demo-state" data-step="2">
                      <div class="rounded-[26px] bg-[linear-gradient(160deg,#e7f3ea,#fbfcf9)] p-5 shadow-sm">
                        <div class="flex items-center justify-between">
                          <p class="text-sm font-bold text-pine">Duration</p>
                          <span class="rounded-full bg-white/80 px-3 py-1 text-[11px] font-bold text-slate-500">Time</span>
                        </div>
                        <p class="mt-2 text-sm text-slate-600">Tune your trip before generation.</p>
                        <div class="mt-5 rounded-[22px] bg-white/88 p-4 shadow-sm">
                          <div class="flex items-center justify-between text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                            <span>Duration</span>
                            <span>5 days</span>
                          </div>
                          <div class="mt-4 grid grid-cols-5 gap-2 text-center text-sm font-semibold">
                            <span class="rounded-2xl bg-sage py-3 text-pine">1</span>
                            <span class="rounded-2xl bg-sage py-3 text-pine">2</span>
                            <span class="rounded-2xl bg-sage py-3 text-pine">3</span>
                            <span class="rounded-2xl bg-sage py-3 text-pine">4</span>
                            <span class="rounded-2xl bg-pine py-3 text-white">5</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="demo-state" data-step="3">
                      <div class="rounded-[26px] bg-[linear-gradient(160deg,#edf7ef,#f9faf6)] p-5 shadow-sm">
                        <div class="flex items-center justify-between">
                          <p class="text-sm font-bold text-pine">Itinerary Workbench</p>
                          <span class="rounded-full bg-white/80 px-3 py-1 text-[11px] font-bold text-slate-500">Day plan</span>
                        </div>
                        <div class="mt-4 space-y-3">
                          <div class="rounded-2xl bg-white/88 p-4 shadow-sm">
                            <p class="text-xs text-slate-500">09:00</p>
                            <p class="mt-1 font-bold text-pine">Temple visit</p>
                          </div>
                          <div class="rounded-2xl bg-white/88 p-4 shadow-sm">
                            <p class="text-xs text-slate-500">12:30</p>
                            <p class="mt-1 font-bold text-pine">Market lunch</p>
                          </div>
                          <div class="rounded-2xl bg-white/88 p-4 shadow-sm">
                            <p class="text-xs text-slate-500">16:00</p>
                            <p class="mt-1 font-bold text-pine">Golden hour walk</p>
                          </div>
                        </div>
                      </div>
                      <div class="mt-4 grid grid-cols-2 gap-3">
                        <div class="rounded-[22px] bg-white/88 p-4 shadow-sm">
                          <p class="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">AI Edit</p>
                          <p class="mt-3 text-sm font-semibold text-pine">Move museum later</p>
                        </div>
                        <div class="rounded-[22px] bg-pine p-4 text-white shadow-sm">
                          <p class="text-xs font-bold uppercase tracking-[0.22em] text-white/70">Output</p>
                          <p class="mt-3 text-sm font-semibold">Booking links + PDF</p>
                        </div>
                      </div>
                    </div>
                    </div>
                    <div class="demo-scroll-hint">
                      <div class="demo-scroll-thumb" id="demo-scroll-thumb"></div>
                    </div>
                  </div>

                  <div class="rounded-[24px] bg-white/90 p-3 shadow-sm">
                    <div class="grid grid-cols-4 gap-2 text-center text-[11px] font-semibold text-slate-500">
                      <div class="rounded-2xl bg-sage/80 px-2 py-2 text-pine">Plan</div>
                      <div class="rounded-2xl px-2 py-2">Explore</div>
                      <div class="rounded-2xl px-2 py-2">Trip</div>
                      <div class="rounded-2xl px-2 py-2">Export</div>
                    </div>
                  </div>

                  <div class="mt-6 flex items-center justify-center gap-3">
                    <button class="demo-dot is-active h-2.5 w-2.5 rounded-full bg-pine/90" data-dot="0" aria-label="Demo step 1"></button>
                    <button class="demo-dot h-2.5 w-2.5 rounded-full bg-pine/25" data-dot="1" aria-label="Demo step 2"></button>
                    <button class="demo-dot h-2.5 w-2.5 rounded-full bg-pine/25" data-dot="2" aria-label="Demo step 3"></button>
                    <button class="demo-dot h-2.5 w-2.5 rounded-full bg-pine/25" data-dot="3" aria-label="Demo step 4"></button>
                  </div>
                </div>
              </div>

              <p class="max-w-sm text-center text-sm leading-6 text-slate-600 lg:text-right" data-i18n="preview_copy">
                The preview follows the same logic as the real app: set the trip, shape preferences, adjust timing, then refine the itinerary.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="features" class="scroll-mt-24 px-4 py-14 sm:px-6 lg:px-10 lg:py-20">
        <div class="mx-auto max-w-7xl">
          <div class="section-fade text-center">
            <p class="text-xs font-bold uppercase tracking-[0.28em] text-slate-500" data-i18n="features_label">Features</p>
            <h2 class="mx-auto mt-4 max-w-3xl text-4xl font-extrabold tracking-tight text-pine sm:text-5xl" data-i18n="features_title">
              A clearer product story, built around the real experience.
            </h2>
            <p class="mx-auto mt-5 max-w-3xl text-lg leading-8 text-slate-600" data-i18n="features_copy">
              WanderAI does more than generate a single result. It lets users define the trip, browse recommendations, freely choose attractions, and keep refining the itinerary afterward.
            </p>
          </div>

          <div class="mt-12 grid gap-6 lg:grid-cols-[0.84fr_1.16fr]">
            <div class="section-fade glass rounded-[34px] border border-white/80 p-7 shadow-soft sm:p-8">
              <p class="text-xs font-bold uppercase tracking-[0.28em] text-slate-500" data-i18n="attraction_label">Attraction Selection</p>
              <h3 class="mt-4 text-3xl font-extrabold tracking-tight text-pine" data-i18n="attraction_title">
                Freely choose the places you want in the trip.
              </h3>
              <p class="mt-5 text-base leading-8 text-slate-600" data-i18n="attraction_copy">
                The app recommends attractions based on destination and preferences, but the final selection still belongs to the user. This makes the experience feel curated, not forced.
              </p>
              <div class="mt-6 space-y-4">
                <div class="feature-bullet flex gap-3 text-sm leading-7 text-slate-600">
                  <p data-i18n="attraction_bullet_1">Browse recommendation cards with category, rating, short descriptions, and quick add actions.</p>
                </div>
                <div class="feature-bullet flex gap-3 text-sm leading-7 text-slate-600">
                  <p data-i18n="attraction_bullet_2">Filter by interest and compare options before deciding what should enter the itinerary.</p>
                </div>
                <div class="feature-bullet flex gap-3 text-sm leading-7 text-slate-600">
                  <p data-i18n="attraction_bullet_3">Generate the itinerary only after enough attractions have been selected, which keeps the plan user-led.</p>
                </div>
              </div>
            </div>

            <div class="section-fade glass rounded-[34px] border border-white/80 p-6 shadow-soft sm:p-7">
              <div class="flex flex-wrap gap-2">
                <span class="rounded-full bg-pine px-4 py-2 text-sm font-semibold text-white">All</span>
                <span class="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">Culture</span>
                <span class="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">Food</span>
                <span class="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">Nature</span>
              </div>

              <div class="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <div class="overflow-hidden rounded-[28px] bg-white shadow-sm ring-1 ring-slate-100">
                  <div class="relative h-40">
                    <img src="https://images.unsplash.com/photo-1570459027562-4a916cc6113f?q=80&w=800&auto=format&fit=crop" alt="Temple" class="h-full w-full object-cover" referrerpolicy="no-referrer" />
                    <span class="absolute left-3 top-3 rounded-full bg-pine px-3 py-1 text-[11px] font-bold text-white">Culture</span>
                    <span class="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold text-slate-700">4.8</span>
                  </div>
                  <div class="p-4">
                    <h4 class="text-base font-bold text-pine">Senso-ji Temple</h4>
                    <p class="mt-2 text-sm leading-6 text-slate-600">Historic, iconic, and easy to place inside a first-day route.</p>
                    <button class="mt-4 w-full rounded-2xl bg-pine px-4 py-3 text-sm font-bold text-white">Add</button>
                  </div>
                </div>

                <div class="overflow-hidden rounded-[28px] bg-white shadow-sm ring-2 ring-emerald/20">
                  <div class="relative h-40">
                    <img src="https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=800&auto=format&fit=crop" alt="Market" class="h-full w-full object-cover" referrerpolicy="no-referrer" />
                    <span class="absolute left-3 top-3 rounded-full bg-pine px-3 py-1 text-[11px] font-bold text-white">Food</span>
                    <span class="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold text-slate-700">4.7</span>
                  </div>
                  <div class="p-4">
                    <h4 class="text-base font-bold text-pine">Tsukiji Market</h4>
                    <p class="mt-2 text-sm leading-6 text-slate-600">A food-heavy stop that matches users who selected local dining interests.</p>
                    <button class="mt-4 w-full rounded-2xl bg-sage px-4 py-3 text-sm font-bold text-pine">Added</button>
                  </div>
                </div>

                <div class="overflow-hidden rounded-[28px] bg-white shadow-sm ring-1 ring-slate-100 sm:col-span-2 xl:col-span-1">
                  <div class="relative h-40">
                    <img src="https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?q=80&w=800&auto=format&fit=crop" alt="Shrine" class="h-full w-full object-cover" referrerpolicy="no-referrer" />
                    <span class="absolute left-3 top-3 rounded-full bg-pine px-3 py-1 text-[11px] font-bold text-white">Nature</span>
                    <span class="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold text-slate-700">4.9</span>
                  </div>
                  <div class="p-4">
                    <h4 class="text-base font-bold text-pine">Meiji Jingu</h4>
                    <p class="mt-2 text-sm leading-6 text-slate-600">A calmer attraction choice for travelers who want green space in the route.</p>
                    <button class="mt-4 w-full rounded-2xl bg-pine px-4 py-3 text-sm font-bold text-white">Add</button>
                  </div>
                </div>
              </div>

              <div class="mt-5 flex items-center justify-between rounded-[26px] bg-pine px-5 py-4 text-white">
                <div>
                  <p class="text-xs font-bold uppercase tracking-[0.24em] text-white/70" data-i18n="selection_status_label">Selection Status</p>
                  <p class="mt-1 text-sm font-semibold" data-i18n="selection_status_value">2 attractions selected</p>
                </div>
                <span class="rounded-full bg-white/14 px-4 py-2 text-sm font-bold" data-i18n="selection_status_cta">Generate itinerary</span>
              </div>
            </div>
          </div>

          <div class="mt-8 grid gap-5 lg:grid-cols-3">
            <div class="section-fade glass rounded-[30px] border border-white/80 p-7 shadow-soft">
              <div class="flex h-12 w-12 items-center justify-center rounded-full bg-sage text-lg font-extrabold text-pine">1</div>
              <h3 class="mt-5 text-2xl font-bold text-pine" data-i18n="feature_card_1_title">Trip setup</h3>
              <p class="mt-3 text-base leading-8 text-slate-600" data-i18n="feature_card_1_copy">
                Start with destinations, trip length, budget, dining style, transport preferences, and personal interests.
              </p>
            </div>

            <div class="section-fade glass rounded-[30px] border border-white/80 p-7 shadow-soft">
              <div class="flex h-12 w-12 items-center justify-center rounded-full bg-sage text-lg font-extrabold text-pine">2</div>
              <h3 class="mt-5 text-2xl font-bold text-pine" data-i18n="feature_card_2_title">AI itinerary editing</h3>
              <p class="mt-3 text-base leading-8 text-slate-600" data-i18n="feature_card_2_copy">
                After generation, the workbench allows users to adjust timing, move activities, and request changes with AI assistance.
              </p>
            </div>

            <div class="section-fade glass rounded-[30px] border border-white/80 p-7 shadow-soft">
              <div class="flex h-12 w-12 items-center justify-center rounded-full bg-sage text-lg font-extrabold text-pine">3</div>
              <h3 class="mt-5 text-2xl font-bold text-pine" data-i18n="feature_card_3_title">Booking and export</h3>
              <p class="mt-3 text-base leading-8 text-slate-600" data-i18n="feature_card_3_copy">
                When the plan is ready, users can continue into booking references and export a PDF version of the itinerary.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="flow" class="scroll-mt-24 px-4 py-4 sm:px-6 lg:px-10 lg:py-10">
        <div class="mx-auto max-w-7xl">
          <div class="section-fade text-center">
            <p class="text-xs font-bold uppercase tracking-[0.28em] text-slate-500" data-i18n="flow_label">Flow</p>
            <h2 class="mx-auto mt-4 max-w-3xl text-4xl font-extrabold tracking-tight text-pine sm:text-5xl" data-i18n="flow_title">
              How the trip comes together inside WanderAI.
            </h2>
            <p class="mx-auto mt-5 max-w-3xl text-lg leading-8 text-slate-600" data-i18n="flow_copy">
              The homepage stays concise, but the actual product flow is deeper. Users move from setup to attraction curation, then into itinerary refinement and final export.
            </p>
          </div>

          <div class="mt-12 grid gap-5 lg:grid-cols-4">
            <div class="section-fade glass rounded-[30px] border border-white/80 p-7 shadow-soft">
              <p class="text-xs font-bold uppercase tracking-[0.26em] text-slate-500">01</p>
              <h3 class="mt-4 text-2xl font-bold text-pine" data-i18n="flow_card_1_title">Input</h3>
              <p class="mt-3 text-sm leading-7 text-slate-600" data-i18n="flow_card_1_copy">Users start by entering destinations, budget, duration, transport, and travel preferences.</p>
            </div>
            <div class="section-fade glass rounded-[30px] border border-white/80 p-7 shadow-soft">
              <p class="text-xs font-bold uppercase tracking-[0.26em] text-slate-500">02</p>
              <h3 class="mt-4 text-2xl font-bold text-pine" data-i18n="flow_card_2_title">Explore</h3>
              <p class="mt-3 text-sm leading-7 text-slate-600" data-i18n="flow_card_2_copy">Recommended attractions are presented as cards so users can filter, compare, and freely select what they want.</p>
            </div>
            <div class="section-fade glass rounded-[30px] border border-white/80 p-7 shadow-soft">
              <p class="text-xs font-bold uppercase tracking-[0.26em] text-slate-500">03</p>
              <h3 class="mt-4 text-2xl font-bold text-pine" data-i18n="flow_card_3_title">Refine</h3>
              <p class="mt-3 text-sm leading-7 text-slate-600" data-i18n="flow_card_3_copy">The itinerary workbench turns those selections into a schedule that can still be edited, reordered, or adjusted with AI.</p>
            </div>
            <div class="section-fade glass rounded-[30px] border border-white/80 p-7 shadow-soft">
              <p class="text-xs font-bold uppercase tracking-[0.26em] text-slate-500">04</p>
              <h3 class="mt-4 text-2xl font-bold text-pine" data-i18n="flow_card_4_title">Output</h3>
              <p class="mt-3 text-sm leading-7 text-slate-600" data-i18n="flow_card_4_copy">Users continue to booking guidance and generate a PDF itinerary when the trip feels complete.</p>
            </div>
          </div>
        </div>
      </section>

${archiveSectionHtml}

      <section class="px-4 pb-16 pt-16 sm:px-6 lg:px-10 lg:pb-24">
        <div class="mx-auto max-w-5xl text-center">
          <div class="section-fade">
            <p class="text-xs font-bold uppercase tracking-[0.28em] text-slate-500" data-i18n="start_label">Start</p>
            <h2 class="mt-4 text-4xl font-extrabold tracking-tight text-pine sm:text-5xl" data-i18n="start_title">
              Ready to explore the world?
            </h2>
            <p class="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-600" data-i18n="start_copy">
              Cleaner first impression, clearer product story, same real experience underneath.
            </p>

            <div class="mt-8 flex justify-center">
              <a
                href="#/preferences"
                id="footer-cta"
                class="inline-flex items-center justify-center rounded-full bg-pine px-8 py-4 text-base font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-emerald"
                data-i18n="start_cta"
              >
                Launch WanderAI
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="contact" class="scroll-mt-24 mt-16 bg-[#141514] text-[#b7b1a6]">
        <div class="mx-auto max-w-7xl px-6 py-14 lg:px-10 lg:py-16">
          <div class="section-fade grid gap-12 lg:grid-cols-[1.3fr_0.7fr_0.85fr]">
            <div>
              <div class="flex items-center gap-3 text-white">
                <span class="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-[#d7c29a]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="9"></circle>
                    <path d="m15.5 8.5-5 7L9 12l6.5-3.5Z"></path>
                  </svg>
                </span>
                <div>
                  <p class="text-2xl font-extrabold tracking-tight">WanderAI</p>
                  <p class="text-[11px] uppercase tracking-[0.28em] text-[#d7c29a]" data-i18n="footer_brand_tag">AI Travel Planner</p>
                </div>
              </div>

              <div class="mt-8 space-y-2 text-[1.65rem] font-medium leading-tight text-[#8f8a82]">
                <p data-i18n="footer_brand_line_1">Plan with less friction.</p>
                <p data-i18n="footer_brand_line_2">Choose what matters.</p>
                <p data-i18n="footer_brand_line_3">Refine until the trip feels right.</p>
              </div>
            </div>

            <div>
              <p class="text-xs font-bold uppercase tracking-[0.28em] text-[#d7c29a]" data-i18n="footer_product_heading">Product</p>
              <div class="mt-8 space-y-7 text-[1.05rem] text-[#a8a39b]">
                <a href="#flow" class="block transition-colors hover:text-white" data-i18n="footer_product_link_1">How It Works</a>
                <a href="#features" class="block transition-colors hover:text-white" data-i18n="footer_product_link_2">Attraction Selection</a>
                <a href="#features" class="block transition-colors hover:text-white" data-i18n="footer_product_link_3">Itinerary Editing</a>
                <a href="#/preferences" class="block transition-colors hover:text-white" data-i18n="footer_product_link_4">Open App</a>
              </div>
            </div>

            <div>
              <p class="text-xs font-bold uppercase tracking-[0.28em] text-[#d7c29a]" data-i18n="footer_contact_heading">Contact</p>
              <div class="mt-8 space-y-7 text-[1.05rem] text-[#a8a39b]">
                <a href="mailto:E1553421@u.nus.edu" class="flex items-center gap-3 transition-colors hover:text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="16" x="2" y="4" rx="2"/>
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                  </svg>
                  <span>Contact Us: E1553421@u.nus.edu</span>
                </a>
              </div>
            </div>
          </div>

          <div class="mt-16 border-t border-white/10 pt-8">
            <div class="flex flex-col gap-4 text-sm text-[#6f6b64] sm:flex-row sm:items-center sm:justify-between">
              <p data-i18n="footer_bottom_copy">© 2026 WanderAI. All rights reserved.</p>
              <p data-i18n="footer_bottom_location">Made in Singapore</p>
            </div>
          </div>
        </div>
      </section>
    </main>

    
  ` }}
    />
  );
}
