import { useState, useEffect } from 'react'
import data from './data/contestData.json'
import './App.css'

function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isRegDropdownOpen, setIsRegDropdownOpen] = useState(false)
  const [openFaqIndex, setOpenFaqIndex] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('home')

  // Smooth scroll to element and close mobile menu
  const scrollToSection = (id) => {
    setIsMobileMenuOpen(false)
    setIsRegDropdownOpen(false)
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  // Monitor scroll to set active nav link
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'news', 'info', 'environment', 'schedule', 'past-problems', 'location', 'faq', 'contact']
      const scrollPosition = window.scrollY + 200

      for (const section of sections) {
        const el = document.getElementById(section)
        if (el) {
          const top = el.offsetTop
          const height = el.offsetHeight
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section)
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index)
  }

  // Filter content for mock search
  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    alert(`搜尋功能模擬：正在搜尋「${searchQuery}」...（在實際環境中可串接全文字檢索）`)
    setIsSearchOpen(false)
  }

  return (
    <>
      {/* Header and Sticky Navigation Bar */}
      <header className="header">
        <div className="header-container container">
          <div className="logo-section" onClick={() => scrollToSection('home')} style={{ cursor: 'pointer' }}>
            <img src="./provident_university.png" alt="靜宜大學 Logo" className="logo-img" />
            <span className="logo-title">靜宜大學</span>
          </div>

          {/* Desktop Navigation Links */}
          <nav>
            <ul className={`nav-menu ${isMobileMenuOpen ? 'open' : ''}`}>
              <li>
                <span
                  className={`nav-link ${activeSection === 'home' ? 'active' : ''}`}
                  onClick={() => scrollToSection('home')}
                >
                  首頁
                </span>
              </li>
              <li>
                <span
                  className={`nav-link ${activeSection === 'news' ? 'active' : ''}`}
                  onClick={() => scrollToSection('news')}
                >
                  最新消息
                </span>
              </li>

              {/* Registration Dropdown */}
              <li className={`nav-dropdown ${isRegDropdownOpen ? 'open-mobile' : ''}`}>
                <span
                  className="nav-link"
                  onClick={() => {
                    if (window.innerWidth <= 768) {
                      setIsRegDropdownOpen(!isRegDropdownOpen)
                    } else {
                      scrollToSection('home')
                    }
                  }}
                >
                  報名 ▼
                </span>
                <ul className="dropdown-menu">
                  <li className="dropdown-item">
                    <a href={data.registration.formLink} target="_blank" rel="noopener noreferrer">線上報名</a>
                  </li>
                  <li className="dropdown-item">
                    <a href="#faq" onClick={(e) => { e.preventDefault(); scrollToSection('faq'); }}>常見問題</a>
                  </li>
                </ul>
              </li>

              <li>
                <span
                  className={`nav-link ${activeSection === 'info' ? 'active' : ''}`}
                  onClick={() => scrollToSection('info')}
                >
                  競賽資訊
                </span>
              </li>
              <li>
                <span
                  className={`nav-link ${activeSection === 'environment' ? 'active' : ''}`}
                  onClick={() => scrollToSection('environment')}
                >
                  競賽環境
                </span>
              </li>
              <li>
                <span
                  className={`nav-link ${activeSection === 'schedule' ? 'active' : ''}`}
                  onClick={() => scrollToSection('schedule')}
                >
                  競賽行程
                </span>
              </li>
              <li>
                <span
                  className={`nav-link ${activeSection === 'past-problems' ? 'active' : ''}`}
                  onClick={() => scrollToSection('past-problems')}
                >
                  歷屆考題
                </span>
              </li>
              <li>
                <span
                  className={`nav-link ${activeSection === 'location' ? 'active' : ''}`}
                  onClick={() => scrollToSection('location')}
                >
                  活動地點
                </span>
              </li>
              <li>
                <span
                  className={`nav-link ${activeSection === 'faq' ? 'active' : ''}`}
                  onClick={() => scrollToSection('faq')}
                >
                  常見問題Q_A
                </span>
              </li>
              <li>
                <span
                  className={`nav-link ${activeSection === 'contact' ? 'active' : ''}`}
                  onClick={() => scrollToSection('contact')}
                >
                  聯絡資訊
                </span>
              </li>

              {/* Search Toggle in navbar */}
              <li>
                <div className="nav-search" onClick={() => setIsSearchOpen(true)}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </div>
              </li>
            </ul>
          </nav>

          {/* Hamburger Menu Toggle for Mobile */}
          <button className="menu-toggle" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section
          id="home"
          className="hero fade-in"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(10, 37, 64, 0.15), rgba(10, 37, 64, 0.5)), url(${data.contest.bannerBg})`
          }}
        >
          <div className="hero-content">
            <div className="hero-badge">{data.contest.abbr}</div>
            <h1 className="hero-title">
              <span>{data.contest.year}</span> {data.contest.title}
            </h1>
            <div className="hero-subtitle">{data.contest.englishTitle}</div>
            <div className="hero-tag">HSPC {data.contest.year}</div>
            <div className="hero-date-badge">競賽日期：{data.contest.dateDisplay}</div>
          </div>
        </section>

        {/* Two-Column Home Main Area */}
        <section className="home-section">
          <div className="container grid-layout">

            {/* Left Column: Purpose & Details */}
            <div className="info-card">
              <div className="info-item">
                <h3 className="info-title">目的</h3>
                <p className="info-text">{data.contest.purpose}</p>
              </div>

              <div className="info-item">
                <h3 className="info-title">報名方式</h3>
                <div className="info-text">
                  <p>報名時間：{data.registration.period}</p>
                  <p>報名費用：<strong>{data.registration.fee}</strong></p>
                  <div className="registration-box">
                    <div className="registration-header">線上組隊報名：</div>
                    <div className="registration-buttons">
                      {data.registration.groups.map((group, index) => (
                        <a
                          key={index}
                          href={group.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-accent"
                        >
                          {group.name} [立即報名]
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="info-item">
                <h3 className="info-title">競賽日期</h3>
                <p className="info-text">{data.contest.dateDisplay}</p>
              </div>

              <div className="info-item">
                <h3 className="info-title">競賽地點</h3>
                <p className="info-text">{data.contact.locationName}</p>
              </div>

              <div className="info-item">
                <h3 className="info-title">主辦單位</h3>
                <ul className="bullet-list">
                  {data.organizers.map((org, index) => (
                    <li key={index}>{org.name}</li>
                  ))}
                </ul>
              </div>

              {data.coOrganizers && data.coOrganizers.length > 0 && (
                <div className="info-item">
                  <h3 className="info-title">協辦單位</h3>
                  <ul className="bullet-list">
                    {data.coOrganizers.map((co, index) => (
                      <li key={index}>{co.name}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Right Column: Sponsors Panel */}
            <div className="side-panel">
              <h3 className="side-panel-title">贊助廠商</h3>
              <div className="sponsor-grid">
                {data.sponsors.map((sponsor, index) => (
                  <div key={index} className="sponsor-card">
                    {sponsor.logo ? (
                      <img src={sponsor.logo} alt={sponsor.name} style={{ maxWidth: '100%', maxHeight: '80px', objectFit: 'contain' }} />
                    ) : (
                      <>
                        <div className="sponsor-logo-placeholder">{sponsor.name}</div>
                        <div className="sponsor-logo-placeholder-sub">(標誌徵集中)</div>
                      </>
                    )}
                    {sponsor.description && (
                      <span className="sponsor-label">{sponsor.description}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </section>

        {/* Large CCI Bottom Brand Area */}
        <section className="brand-area">
          <div className="container brand-grid">
            <div className="brand-left">
              <img src="./college_of_computer_and_information.gif" alt="資訊學院 Logo" className="brand-logo-large" />
              <div>
                <div className="brand-title-large">靜宜大學資訊學院</div>
                <div className="brand-title-sub">College of Computing and Informatics</div>
              </div>
            </div>
            <div className="brand-right">
              <div className="contact-label-large">聯絡我們</div>
              <a href={`mailto:${data.contact.collegeEmail}`} className="contact-email-large">
                Email : {data.contact.collegeEmail}
              </a>
            </div>
          </div>
        </section>

        {/* Latest News Section */}
        <section id="news" className="section-wrapper">
          <div className="container">
            <div className="news-header-layout">
              <div className="news-title-area">
                <h2 className="section-title">最新消息</h2>
                <p className="section-desc">競賽相關公告與時程提醒</p>
              </div>
              <div className="important-dates-card">
                <div className="dates-header">重要日期 :</div>
                <div className="dates-list">
                  <div className="date-item">
                    <span className="date-label">報名開始 :</span>
                    <span className="date-value">115年07月06日 (即日起)</span>
                  </div>
                  <div className="date-item">
                    <span className="date-label">報名截止 :</span>
                    <span className="date-value">115年07月23日 (四)</span>
                  </div>
                  <div className="date-item">
                    <span className="date-label">競賽時間 :</span>
                    <span className="date-value">{data.contest.dateDisplay}</span>
                  </div>
                </div>
              </div>
            </div>
            <hr className="news-divider" />
            <div className="news-container">
              {data.news.map((item) => (
                <article key={item.id} className="news-card">
                  <div className="news-meta">
                    <span className="news-date">{item.date}</span>
                  </div>
                  <h3 className="news-card-title">
                    {item.url ? (
                      <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>
                        {item.title} <span style={{ fontSize: '0.8em', color: 'var(--accent-gold)', marginLeft: '4px' }}>🔗</span>
                      </a>
                    ) : (
                      item.title
                    )}
                  </h3>
                  <p className="news-content">{item.content}</p>
                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary"
                      style={{ display: 'inline-flex', padding: '6px 12px', fontSize: '0.8rem', marginTop: '12px' }}
                    >
                      開啟連結
                    </a>
                  )}
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Contest Info Section */}
        <section id="info" className="section-wrapper">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">競賽資訊</h2>
              <p className="section-desc">競賽對象與規則要點</p>
            </div>
            <div className="info-grid">
              <div className="news-card">
                <h3 className="news-card-title" style={{ color: 'var(--primary-navy)', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                  競賽規格說明
                </h3>
                <ul className="bullet-list" style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <li><strong>參加對象：</strong>{data.contestInfo.target}</li>
                  <li><strong>組隊方式：</strong>{data.contestInfo.teamRule}（可設指導老師一名）</li>
                  <li><strong>程式語言：</strong>{data.contestInfo.languages}</li>
                  <li><strong>工作坊安排：</strong>{data.contestInfo.workshop}（提供程式能力與解題培訓）</li>
                </ul>
              </div>

              <div className="news-card">
                <h3 className="news-card-title" style={{ color: 'var(--primary-navy)', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                  獎項與獎金
                </h3>
                <ul className="bullet-list" style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <li><strong>評選等級：</strong>本屆競賽將依競賽結果擇優頒發金獎、銀獎、銅獎及佳作若干名。</li>
                  <li><strong>第一名 (金獎)：</strong>每隊可獲得新台幣 <strong>12,000 元</strong>之獎金</li>
                  <li><strong>第二名 (銀獎)：</strong>每隊可獲得新台幣 <strong>9,000 元</strong>之獎金</li>
                  <li><strong>第三名 (銅獎)：</strong>每隊可獲得新台幣 <strong>6,000 元</strong>之獎金</li>
                  <li><strong>佳作組別 (五組)：</strong>每組可獲得新台幣 <strong>3,000 元</strong>之獎金</li>
                </ul>
              </div>
            </div>

            <div className="info-rules" style={{ marginTop: '30px' }}>
              <div className="news-card">
                <h3 className="news-card-title" style={{ color: 'var(--primary-navy)', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                  詳細競賽規則
                </h3>
                <ol className="rules-list" style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '16px', paddingLeft: '0', listStyle: 'none' }}>
                  {data.rules && data.rules.map((rule, idx) => (
                    <li key={idx} style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'var(--primary-navy)',
                        color: 'white',
                        borderRadius: '50%',
                        width: '28px',
                        height: '28px',
                        minWidth: '28px',
                        fontSize: '0.9rem',
                        fontWeight: 'bold',
                        marginTop: '2px'
                      }}>
                        {idx + 1}
                      </span>
                      <span style={{ color: rule.includes('工作坊') ? '#dc2626' : 'var(--text-primary)', fontSize: '1rem', lineHeight: '1.6' }}>
                        {rule}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </section>

        {/* Contest Environment Section */}
        <section id="environment" className="section-wrapper">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">競賽環境</h2>
              <p className="section-desc">上機編譯器與編輯器規格</p>
            </div>

            <div className="env-grid">
              {data.environment.compilers.map((comp, idx) => (
                <div key={idx} className="env-card">
                  <h3 className="env-card-title">
                    <span style={{ color: 'var(--accent-orange)' }}>■</span> {comp.name}
                  </h3>
                  <p className="env-card-desc">{comp.detail}</p>
                </div>
              ))}
            </div>

            <div className="env-editors">
              <h3 className="env-editors-title">可用整合開發環境 (IDE / Editors)</h3>
              <ul className="env-editors-list">
                {data.environment.editors.map((editor, idx) => (
                  <li key={idx}>✓ {editor}</li>
                ))}
              </ul>
            </div>

            <div className="env-note">
              <strong>注意事項：</strong>{data.environment.notes}
            </div>
          </div>
        </section>

        {/* Contest Schedule Section */}
        <section id="schedule" className="section-wrapper">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">競賽行程</h2>
              <p className="section-desc">工作坊與競賽當日時間安排</p>
            </div>

            <div className="schedule-container">
              {data.schedule.map((day, idx) => (
                <div key={idx} className="schedule-day-block">
                  <div className="schedule-day-header">
                    <span className="schedule-day-title">{day.title}</span>
                    <span className="schedule-day-date">{day.date}</span>
                  </div>
                  <div className="schedule-table">
                    {day.items.map((item, itemIdx) => (
                      <div key={itemIdx} className="schedule-row">
                        <div className="schedule-time">{item.time}</div>
                        <div className="schedule-event">{item.event}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Past Problems Section */}
        <section id="past-problems" className="section-wrapper">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">歷屆考題</h2>
              <p className="section-desc">提供歷屆程式設計競賽題目參考</p>
            </div>

            <div className="past-list-container">
              <ul className="past-list">
                {data.pastProblems.map((prob, idx) => (
                  <li key={idx} className="past-item">
                    <a
                      href={prob.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="past-item-link"
                    >
                      {prob.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Event Location Section */}
        <section id="location" className="section-wrapper">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">活動地點</h2>
              <p className="section-desc">靜宜大學校區與考場位置</p>
            </div>

            <div className="location-info-block">
              <h3 className="location-subtitle">靜宜大學</h3>
              <p className="location-address">{data.contact.address}</p>
              <p className="location-room">{data.contact.locationName}</p>
            </div>

            <div className="location-maps-layout">
              <div className="location-map-box">
                <h4 className="map-box-title">靜宜大學校園導覽圖</h4>
                <div className="campus-map-wrapper">
                  <a href="./school_map.jpg" target="_blank" rel="noopener noreferrer" title="點擊查看大圖">
                    <img src="./school_map.jpg" alt="靜宜大學校園導覽圖" className="campus-map-img" />
                  </a>
                </div>
              </div>
              <div className="location-map-box">
                <h4 className="map-box-title">Google 地圖導航</h4>
                <div className="google-map-wrapper">
                  <iframe
                    src="https://maps.google.com/maps?q=靜宜大學+主顧樓&t=&z=16&ie=UTF8&iwloc=&output=embed"
                    className="google-map-iframe"
                    allowFullScreen=""
                    loading="lazy"
                    title="靜宜大學 主顧樓 Google 地圖"
                  ></iframe>
                </div>
              </div>
            </div>

            <div className="traffic-guide-section">
              <h3 className="traffic-guide-title">如何到靜宜 (交通資訊)</h3>

              <div className="traffic-grid">
                {/* 自行開車 */}
                <div className="traffic-card-modern">
                  <div className="traffic-card-header">
                    <span className="traffic-icon-lg">🚗</span>
                    <h4>自行開車</h4>
                  </div>
                  <div className="traffic-card-body">
                    <div className="traffic-sub-item">
                      <h5>國道一號 (中山高速公路)</h5>
                      <p>中港交流道 (178.6KM) 出口，往沙鹿方向行駛，沿臺灣大道約 11 公里即可抵達本校。車程約 20 分鐘。</p>
                    </div>
                    <div className="traffic-sub-item">
                      <h5>國道三號 (福爾摩沙高速公路)</h5>
                      <p><strong>北上：</strong>龍井交流道 (182.8KM) 出口，往台中方向行駛，經中興路左轉，於台灣大道六段左轉，約 4 公里即可抵達本校。車程約 10 分鐘。</p>
                      <p><strong>南下：</strong>沙鹿交流道 (176.1KM) 出口，往沙鹿方向行駛，沿中清路七段左轉三民路，於台灣大道七段左轉，即可抵達本校. 車程約 5-10 分鐘。</p>
                    </div>
                    <div className="traffic-sub-item gps-highlight">
                      <h5>GPS 衛星導航座標</h5>
                      <p>北緯 24.2257 ； 東經 120.5772</p>
                    </div>
                  </div>
                </div>

                {/* 大眾運輸 - 高鐵 */}
                <div className="traffic-card-modern">
                  <div className="traffic-card-header">
                    <span className="traffic-icon-lg">🚄</span>
                    <h4>搭乘高鐵</h4>
                  </div>
                  <div className="traffic-card-body">
                    <p className="traffic-note">來賓搭乘高鐵來靜宜大學，請於「台中站」下車，並可以下列方式轉乘至本校：</p>
                    <ul className="traffic-list">
                      <li><strong>1. 計程車：</strong>搭乘高鐵台中站後，請至 1 樓搭乘排班計程車前往靜宜大學（可請司機直接駛入校內希嘉學苑、思源學苑或善牧學苑）。</li>
                      <li><strong>2. 搭乘和欣客運 161 路：</strong>轉乘 161 路至榮總/東海大學站下車（約 40 分鐘），再轉乘優化公車 300~310 號至靜宜大學站（約 15 分鐘）。</li>
                      <li><strong>3. 區間車：</strong>至新烏日車站搭乘台鐵區間車至沙鹿火車站，再轉乘計程車或公車至靜宜大學。或可搭乘往「台中方向」的公車，並在台中火車站下車。</li>
                      <li><strong>4. 台中捷運：</strong>步行至高鐵台中站捷運站搭乘至「市政府站」，再轉乘優化公車 300~310 號至靜宜大學站（約 25 分鐘）。</li>
                    </ul>
                  </div>
                </div>

                {/* 大眾運輸 - 臺鐵 */}
                <div className="traffic-card-modern">
                  <div className="traffic-card-header">
                    <span className="traffic-icon-lg">🚂</span>
                    <h4>搭乘臺鐵</h4>
                  </div>
                  <div className="traffic-card-body">
                    <ul className="traffic-list">
                      <li><strong>1. 經海線至沙鹿火車站 (建議搭乘)：</strong>抵達沙鹿火車站後，轉乘計程車；或步行 5 分鐘至中山路（全家沙鹿巨業店前）搭乘「往台中方向」的公車，於靜宜大學站下車；或可搭乘 162 路公車、301 路公車直接入校。</li>
                      <li><strong>2. 經山線至台中火車站：</strong>抵達台中火車站後，請至車站出口轉乘優化公車 300~310 號（車程約 50 分鐘）至靜宜大學站，亦可轉乘 301 路公車直接入校。</li>
                    </ul>
                  </div>
                </div>

                {/* 大眾運輸 - 公車 & 國道客運 */}
                <div className="traffic-card-modern">
                  <div className="traffic-card-header">
                    <span className="traffic-icon-lg">🚌</span>
                    <h4>公車 & 國道客運</h4>
                  </div>
                  <div className="traffic-card-body">
                    <div className="traffic-sub-item">
                      <h5>市區公車優惠與入校線路</h5>
                      <p className="bus-highlight">※設籍台中市市民且完成綁卡程序者，搭乘市區公車刷卡享 10 公里免費。</p>
                      <p className="bus-direct">※搭乘台中市 <strong>162 路公車</strong>、<strong>301 路公車</strong>者，皆可直接入校。</p>
                    </div>
                    <div className="traffic-sub-item">
                      <h5>搭乘國道客運轉乘</h5>
                      <p><strong>朝馬站下車：</strong>步行至臺灣大道秋紅谷站轉乘優化公車 300~310 號（約 25 分鐘）。</p>
                      <p><strong>中港轉運站下車：</strong>步行至臺灣大道福安站轉乘優化公車 300~310 號（約 20 分鐘）。</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 外部連結 */}
              <div className="traffic-links-box">
                <span className="links-box-title">🔗 交通相關資料連結</span>
                <div className="links-grid">
                  <a href="https://www.thsrc.com.tw/" target="_blank" rel="noopener noreferrer" className="traffic-link-btn">台灣高鐵官網</a>
                  <a href="https://tip.railway.gov.tw/tra-tip-web/tip" target="_blank" rel="noopener noreferrer" className="traffic-link-btn">台灣鐵路管理局官網</a>
                  <a href="https://www.taoyuan-airport.com/" target="_blank" rel="noopener noreferrer" className="traffic-link-btn">桃園機場交通資訊</a>
                  <a href="https://www.tca.gov.tw/" target="_blank" rel="noopener noreferrer" className="traffic-link-btn">台中航空站公車資訊</a>
                  <a href="https://www.kia.gov.tw/" target="_blank" rel="noopener noreferrer" className="traffic-link-btn">高雄國際航空站</a>
                  <a href="https://www.krtc.com.tw/" target="_blank" rel="noopener noreferrer" className="traffic-link-btn">高雄捷運官網</a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="section-wrapper">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">常見問題 Q&A</h2>
              <p className="section-desc">解答您參賽或報名的各種疑慮</p>
            </div>

            <div className="faq-container">
              {data.faq && data.faq.length > 0 ? (
                data.faq.map((item, idx) => (
                  <div key={idx} className={`faq-item ${openFaqIndex === idx ? 'open' : ''}`}>
                    <div className="faq-question" onClick={() => toggleFaq(idx)}>
                      <span>{item.question}</span>
                      <span className="faq-question-arrow">▼</span>
                    </div>
                    {openFaqIndex === idx && (
                      <div className="faq-answer">
                        {item.answer}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-light)', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-primary)' }}>
                  <span style={{ fontSize: '2rem', display: 'block', marginBottom: '10px' }}>💬</span>
                  常見問題正在研擬中，敬請期待！
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Contact Info Section */}
        <section id="contact" className="section-wrapper" style={{ borderBottom: 'none' }}>
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">聯絡我們</h2>
              <p className="section-desc" style={{ maxWidth: '800px', margin: '0 auto', fontSize: '1.05rem', lineHeight: '1.7' }}>
                有任何關於本競賽之問題，均歡迎以官方信箱或電話連繫，我們將竭誠為您服務。
              </p>
            </div>

            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
              <div className="contact-card">
                <div className="contact-method">
                  <span className="contact-icon">✉</span>
                  <div>
                    <div className="contact-text-title">電子信箱</div>
                    <a href={`mailto:${data.contact.email}`} className="contact-text-value" style={{ color: 'var(--primary-navy)' }}>
                      {data.contact.email}
                    </a>
                  </div>
                </div>
                <div className="contact-method">
                  <span className="contact-icon">📞</span>
                  <div>
                    <div className="contact-text-title">聯絡電話</div>
                    <div className="contact-text-value" style={{ color: 'var(--text-primary)' }}>{data.contact.phone}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-info">
            主辦單位：靜宜大學資訊學院、靜宜大學資訊工程學系
          </div>
          <div className="footer-info" style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>
            協辦單位：{data.coOrganizers ? data.coOrganizers.map(c => c.name).join('、') : ''}
          </div>
          <div className="footer-credit">
            © {data.contest.year} 靜宜大學資訊學院 版權所有. Designed for {data.contest.abbr}.
          </div>
        </div>
      </footer>

      {/* Search Modal */}
      {isSearchOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(10, 37, 64, 0.8)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'var(--bg-primary)',
            padding: '30px',
            borderRadius: 'var(--radius-lg)',
            width: '100%',
            maxWidth: '500px',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--primary-navy)' }}>站內搜尋</h3>
              <button
                onClick={() => setIsSearchOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-light)' }}
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleSearchSubmit}>
              <input
                type="text"
                placeholder="請輸入關鍵字（例如：工作坊、編譯器、報名）"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  fontSize: '1rem',
                  outline: 'none',
                  marginBottom: '16px'
                }}
                autoFocus
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(false)}
                  className="btn"
                  style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                >
                  取消
                </button>
                <button type="submit" className="btn btn-primary">
                  搜尋
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

export default App
