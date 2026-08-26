import { useState, useEffect, useMemo } from 'react'
import initialData from './data/contestData.json'
import './App.css'

function App() {
  // Reactive contest data state (always use published contestData.json)
  const [data, setData] = useState(() => {
    try {
      localStorage.removeItem('hspc2026_custom_data')
    } catch (e) {
      console.error('Failed to clear old custom data', e)
    }
    return initialData
  })

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isRegDropdownOpen, setIsRegDropdownOpen] = useState(false)
  const [openFaqIndex, setOpenFaqIndex] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('home')
  const [scoreboardFilter, setScoreboardFilter] = useState('')

  // Admin Mode States
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    try {
      return sessionStorage.getItem('hspc2026_admin_auth') === 'true'
    } catch {
      return false
    }
  })
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false)
  const [passwordInput, setPasswordInput] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })

  // Form state inside Admin Modal
  const [adminFormData, setAdminFormData] = useState({
    isAnnounced: false,
    publishDate: '',
    awards: []
  })

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type })
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' })
    }, 4000)
  }

  // Open Admin Handler
  const handleOpenAdmin = () => {
    if (isAdminLoggedIn) {
      setAdminFormData({
        isAnnounced: Boolean(data.isAnnounced ?? data.results?.isAnnounced),
        publishDate: data.results?.publishDate || '115年08月26日',
        awards: data.results?.awards ? JSON.parse(JSON.stringify(data.results.awards)) : []
      })
      setIsAdminModalOpen(true)
    } else {
      setPasswordInput('')
      setPasswordError('')
      setIsPasswordModalOpen(true)
    }
  }

  // Password Submit
  const handlePasswordSubmit = (e) => {
    e.preventDefault()
    const correctPassword = data.adminPassword || initialData.adminPassword || 'hspc2026'
    if (passwordInput.trim() === correctPassword) {
      try {
        sessionStorage.setItem('hspc2026_admin_auth', 'true')
      } catch {}
      setIsAdminLoggedIn(true)
      setIsPasswordModalOpen(false)
      setPasswordInput('')
      setPasswordError('')
      setAdminFormData({
        isAnnounced: Boolean(data.isAnnounced ?? data.results?.isAnnounced),
        publishDate: data.results?.publishDate || '115年08月26日',
        awards: data.results?.awards ? JSON.parse(JSON.stringify(data.results.awards)) : []
      })
      setIsAdminModalOpen(true)
      showToast('🔓 管理員驗證成功，已進入線上管理後台！', 'success')
    } else {
      setPasswordError('❌ 密碼不正確，請重新輸入！')
    }
  }

  // Logout Admin
  const handleAdminLogout = () => {
    try {
      sessionStorage.removeItem('hspc2026_admin_auth')
    } catch {}
    setIsAdminLoggedIn(false)
    setIsAdminModalOpen(false)
    showToast('🚪 已登出管理員身份', 'info')
  }

  // Toggle isAnnounced in Admin Form
  const handleToggleAnnounce = () => {
    setAdminFormData((prev) => ({
      ...prev,
      isAnnounced: !prev.isAnnounced
    }))
  }

  // Update specific award field
  const handleUpdateAward = (index, field, value) => {
    setAdminFormData((prev) => {
      const nextAwards = [...prev.awards]
      nextAwards[index] = {
        ...nextAwards[index],
        [field]: value
      }
      return { ...prev, awards: nextAwards }
    })
  }

  // Select team for award from dropdown
  const handleSelectTeam = (index, teamNo) => {
    if (!teamNo) return
    const team = data.results?.teamsList?.find((t) => t.teamNo === teamNo)
    setAdminFormData((prev) => {
      const nextAwards = [...prev.awards]
      nextAwards[index] = {
        ...nextAwards[index],
        teamNo: team ? team.teamNo : teamNo,
        teamName: team ? team.teamName : nextAwards[index].teamName,
        school: team ? team.school : nextAwards[index].school
      }
      return { ...prev, awards: nextAwards }
    })
  }

  // Add award item (e.g. new honorable mention)
  const handleAddAward = () => {
    setAdminFormData((prev) => {
      const nextRank = prev.awards.length + 1
      const newItem = {
        rank: nextRank,
        award: '佳作',
        awardIcon: '🎖️',
        teamNo: '',
        teamName: '',
        school: '',
        prize: '新台幣 3,000 元',
        solved: 0,
        penalty: 0
      }
      return { ...prev, awards: [...prev.awards, newItem] }
    })
  }

  // Delete award item
  const handleDeleteAward = (index) => {
    setAdminFormData((prev) => {
      const nextAwards = prev.awards.filter((_, idx) => idx !== index)
      const reRanked = nextAwards.map((item, idx) => ({
        ...item,
        rank: idx + 1
      }))
      return { ...prev, awards: reRanked }
    })
  }

  // Build full updated JSON data containing all fields
  const getFullUpdatedData = () => {
    const updatedAwards = adminFormData.awards
    const updatedScoreboard = updatedAwards.map((a, idx) => ({
      rank: a.rank || idx + 1,
      teamNo: a.teamNo || `S0${idx + 1}`,
      teamName: a.teamName || '',
      school: a.school || '',
      solved: Number(a.solved) || 0,
      penalty: Number(a.penalty) || 0,
      award: a.award || '佳作',
      problems: {
        A: { solved: false, time: 0, tries: 0 },
        B: { solved: false, time: 0, tries: 0 },
        C: { solved: false, time: 0, tries: 0 },
        D: { solved: false, time: 0, tries: 0 },
        E: { solved: false, time: 0, tries: 0 },
        F: { solved: false, time: 0, tries: 0 }
      }
    }))

    return {
      _comment: data._comment || initialData._comment,
      _results_announcement_toggle: data._results_announcement_toggle || initialData._results_announcement_toggle,
      isAnnounced: adminFormData.isAnnounced,
      adminPassword: data.adminPassword || initialData.adminPassword || 'hspc2026',
      contest: data.contest || initialData.contest,
      contestInfo: data.contestInfo || initialData.contestInfo,
      registration: data.registration || initialData.registration,
      contact: data.contact || initialData.contact,
      organizers: data.organizers || initialData.organizers,
      coOrganizers: data.coOrganizers || initialData.coOrganizers,
      sponsors: data.sponsors || initialData.sponsors,
      news: data.news || initialData.news,
      environment: data.environment || initialData.environment,
      schedule: data.schedule || initialData.schedule,
      pastProblems: data.pastProblems || initialData.pastProblems,
      rules: data.rules || initialData.rules,
      faq: data.faq || initialData.faq,
      results: {
        ...(data.results || initialData.results),
        isAnnounced: adminFormData.isAnnounced,
        status: adminFormData.isAnnounced ? '已公佈' : '待公佈',
        publishDate: adminFormData.publishDate || (data.results?.publishDate || '115年08月26日'),
        awards: updatedAwards,
        scoreboard: updatedScoreboard
      }
    }
  }

  // Save changes
  const handleSaveAdmin = () => {
    const updatedData = getFullUpdatedData()
    setData(updatedData)
    try {
      localStorage.setItem('hspc2026_custom_data', JSON.stringify(updatedData))
    } catch (e) {
      console.error('Failed to save to localStorage', e)
    }
    showToast('💾 成績資料已成功儲存並即時套用至畫面！', 'success')
  }

  // Copy full JSON for GitHub
  const handleCopyJson = () => {
    const updatedData = getFullUpdatedData()
    const jsonString = JSON.stringify(updatedData, null, 2)
    navigator.clipboard.writeText(jsonString).then(
      () => {
        showToast('📋 已複製整個完整 contestData.json！可直接貼上覆蓋 GitHub 檔案發布。', 'success')
      },
      () => {
        showToast('複製失敗，請手動下載或複製', 'error')
      }
    )
  }

  // Download full JSON file
  const handleDownloadJson = () => {
    const updatedData = getFullUpdatedData()
    const jsonString = JSON.stringify(updatedData, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'contestData.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    showToast('📥 完整 contestData.json 檔案已開始下載！', 'success')
  }

  // Reset to default
  const handleResetDefault = () => {
    if (window.confirm('確定要清除自訂修改，恢復為原始預設資料嗎？')) {
      try {
        localStorage.removeItem('hspc2026_custom_data')
      } catch {}
      setData(initialData)
      setAdminFormData({
        isAnnounced: Boolean(initialData.isAnnounced ?? initialData.results?.isAnnounced),
        publishDate: initialData.results?.publishDate || '115年08月26日',
        awards: initialData.results?.awards ? JSON.parse(JSON.stringify(initialData.results.awards)) : []
      })
      showToast('🔄 已恢復為程式預設資料。', 'info')
    }
  }

  // View state: 'home' or 'results'
  const [currentView, setCurrentView] = useState(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.toLowerCase()
      if (hash === '#results' || hash === '#/results') {
        return 'results'
      }
    }
    return 'home'
  })

  // Sync hash routing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase()
      if (hash === '#results' || hash === '#/results') {
        setCurrentView('results')
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        setCurrentView('home')
        if (hash && hash !== '#' && hash !== '#/' && hash !== '#home') {
          const id = hash.replace(/^#\/?/, '')
          setTimeout(() => {
            const el = document.getElementById(id)
            if (el) el.scrollIntoView({ behavior: 'smooth' })
          }, 50)
        }
      }
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  // Navigation handler
  const navigateTo = (view, sectionId = null) => {
    setIsMobileMenuOpen(false)
    setIsRegDropdownOpen(false)

    if (view === 'results') {
      window.location.hash = '#results'
      setCurrentView('results')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      if (currentView !== 'home') {
        setCurrentView('home')
        if (sectionId) {
          window.location.hash = `#${sectionId}`
          setTimeout(() => {
            const el = document.getElementById(sectionId)
            if (el) el.scrollIntoView({ behavior: 'smooth' })
          }, 50)
        } else {
          window.location.hash = '#home'
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }
      } else {
        if (sectionId) {
          const el = document.getElementById(sectionId)
          if (el) el.scrollIntoView({ behavior: 'smooth' })
        } else {
          const el = document.getElementById('home')
          if (el) el.scrollIntoView({ behavior: 'smooth' })
        }
      }
    }
  }

  // Smooth scroll to element and close mobile menu
  const scrollToSection = (id) => {
    navigateTo('home', id)
  }

  // Monitor scroll to set active nav link
  useEffect(() => {
    if (currentView !== 'home') return

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
  }, [currentView])

  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index)
  }

  // Filter content for mock search
  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    const query = searchQuery.trim().toLowerCase()
    setIsSearchOpen(false)
    if (query.includes('成績') || query.includes('得獎') || query.includes('名單') || query.includes('金獎') || query.includes('銀獎') || query.includes('銅獎') || query.includes('佳作') || query.includes('獎狀')) {
      navigateTo('results')
    } else {
      alert(`搜尋功能模擬：正在搜尋「${searchQuery}」...（您可在「得獎名單」頁面查看完整賽事成績與得獎名單）`)
    }
  }

  const isAnnounced = Boolean(data.isAnnounced ?? data.results?.isAnnounced)

  // Filter scoreboard items
  const filteredScoreboard = useMemo(() => {
    if (!data.results || !data.results.scoreboard) return []
    if (!scoreboardFilter.trim()) return data.results.scoreboard
    const term = scoreboardFilter.trim().toLowerCase()
    return data.results.scoreboard.filter(
      (item) =>
        item.teamName.toLowerCase().includes(term) ||
        item.school.toLowerCase().includes(term) ||
        item.teamNo.toLowerCase().includes(term) ||
        (item.award && item.award.toLowerCase().includes(term))
    )
  }, [scoreboardFilter, data.results?.scoreboard])

  // Filter teams list when pending announcement
  const filteredTeamsList = useMemo(() => {
    if (!data.results || !data.results.teamsList) return []
    if (!scoreboardFilter.trim()) return data.results.teamsList
    const term = scoreboardFilter.trim().toLowerCase()
    return data.results.teamsList.filter(
      (item) =>
        item.teamName.toLowerCase().includes(term) ||
        item.school.toLowerCase().includes(term) ||
        item.teamNo.toLowerCase().includes(term)
    )
  }, [scoreboardFilter, data.results?.teamsList])

  // Lookup map for teams by teamNo
  const teamByNo = useMemo(() => {
    const map = {}
    if (data.results?.teamsList) {
      data.results.teamsList.forEach((t) => {
        map[t.teamNo] = t
      })
    }
    return map
  }, [data.results?.teamsList])

  // Podium awards (Gold, Silver, Bronze - Top 4)
  const podiumAwards = useMemo(() => {
    if (!data.results || !data.results.awards) return []
    return data.results.awards.filter((a) => (a.award === '金獎' || a.award === '銀獎' || a.award === '銅獎' || a.rank <= 4) && a.teamName)
  }, [data.results?.awards])

  // Honorable mentions (佳作)
  const honorableAwards = useMemo(() => {
    if (!data.results || !data.results.awards) return []
    return data.results.awards.filter((a) => a.award === '佳作' && a.teamName)
  }, [data.results?.awards])

  return (
    <>
      {/* Header and Sticky Navigation Bar */}
      <header className="header">
        <div className="header-container container">
          <div className="logo-section" onClick={() => navigateTo('home', 'home')} style={{ cursor: 'pointer' }}>
            <img src="./provident_university.png" alt="靜宜大學 Logo" className="logo-img" />
            <span className="logo-title">靜宜大學</span>
          </div>

          {/* Desktop Navigation Links */}
          <nav>
            <ul className={`nav-menu ${isMobileMenuOpen ? 'open' : ''}`}>
              <li>
                <span
                  className={`nav-link ${currentView === 'home' && activeSection === 'home' ? 'active' : ''}`}
                  onClick={() => navigateTo('home', 'home')}
                >
                  首頁
                </span>
              </li>
              <li>
                <span
                  className={`nav-link ${currentView === 'home' && activeSection === 'news' ? 'active' : ''}`}
                  onClick={() => navigateTo('home', 'news')}
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
                      navigateTo('home', 'home')
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
                    <a href="#faq" onClick={(e) => { e.preventDefault(); navigateTo('home', 'faq'); }}>常見問題</a>
                  </li>
                </ul>
              </li>

              <li>
                <span
                  className={`nav-link ${currentView === 'home' && activeSection === 'info' ? 'active' : ''}`}
                  onClick={() => navigateTo('home', 'info')}
                >
                  競賽資訊
                </span>
              </li>
              <li>
                <span
                  className={`nav-link ${currentView === 'home' && activeSection === 'environment' ? 'active' : ''}`}
                  onClick={() => navigateTo('home', 'environment')}
                >
                  競賽環境
                </span>
              </li>
              <li>
                <span
                  className={`nav-link ${currentView === 'home' && activeSection === 'schedule' ? 'active' : ''}`}
                  onClick={() => navigateTo('home', 'schedule')}
                >
                  競賽行程
                </span>
              </li>
              <li>
                <span
                  className={`nav-link ${currentView === 'home' && activeSection === 'past-problems' ? 'active' : ''}`}
                  onClick={() => navigateTo('home', 'past-problems')}
                >
                  歷屆考題
                </span>
              </li>
              <li>
                <span
                  className={`nav-link ${currentView === 'home' && activeSection === 'location' ? 'active' : ''}`}
                  onClick={() => navigateTo('home', 'location')}
                >
                  活動地點
                </span>
              </li>
              <li>
                <span
                  className={`nav-link ${currentView === 'home' && activeSection === 'faq' ? 'active' : ''}`}
                  onClick={() => navigateTo('home', 'faq')}
                >
                  常見問題Q_A
                </span>
              </li>

              {/* Awards / Results / Seating Navigation Link */}
              <li>
                <span
                  className={`nav-link nav-link-results-tab ${currentView === 'results' ? 'active' : ''}`}
                  onClick={() => navigateTo('results')}
                >
                  🏆 得獎名單 / 座位表
                </span>
              </li>

              <li>
                <span
                  className={`nav-link ${currentView === 'home' && activeSection === 'contact' ? 'active' : ''}`}
                  onClick={() => navigateTo('home', 'contact')}
                >
                  聯絡資訊
                </span>
              </li>

              {/* Search Toggle in navbar */}
              <li>
                <div className="nav-search" onClick={() => setIsSearchOpen(true)} title="站內搜尋">
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
        {currentView === 'home' ? (
          <>
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

            {/* Quick Button to Results Page */}
            {data.results && (
              <div style={{ marginTop: '20px' }}>
                <button
                  onClick={() => navigateTo('results')}
                  className="btn btn-results-hero"
                >
                  {isAnnounced
                    ? '🏆 競賽結果已出爐！點此查看得獎名單與成績 ➔'
                    : '🏆 前往得獎名單及成績專區 ➔'}
                </button>
              </div>
            )}
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
                    {item.url === '#results' ? (
                      <span
                        onClick={() => navigateTo('results')}
                        style={{ color: 'inherit', cursor: 'pointer' }}
                      >
                        {item.title} <span style={{ fontSize: '0.8em', color: 'var(--accent-gold)', marginLeft: '4px' }}>🏆</span>
                      </span>
                    ) : item.url ? (
                      <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>
                        {item.title} <span style={{ fontSize: '0.8em', color: 'var(--accent-gold)', marginLeft: '4px' }}>🔗</span>
                      </a>
                    ) : (
                      item.title
                    )}
                  </h3>
                  <p className="news-content">{item.content}</p>
                  {item.url === '#results' ? (
                    <button
                      onClick={() => navigateTo('results')}
                      className="btn btn-primary"
                      style={{ display: 'inline-flex', padding: '6px 12px', fontSize: '0.8rem', marginTop: '12px' }}
                    >
                      🏆 查看得獎名單
                    </button>
                  ) : item.url ? (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary"
                      style={{ display: 'inline-flex', padding: '6px 12px', fontSize: '0.8rem', marginTop: '12px' }}
                    >
                      開啟連結
                    </a>
                  ) : null}
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
                  <li><strong>組隊方式：</strong>{data.contestInfo.teamRule}<span style={{ color: '#dc2626' }}>(每組至少一位成員必須參加工作坊)</span>（可設指導老師一名）</li>
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
          </>
        ) : (
          /* ====================================================================
             AWARDS & RESULTS (得獎名單與成績) PAGE VIEW
             ==================================================================== */
          <div className="results-page-view fade-in">
            {/* Results Page Hero */}
            <section className="results-hero">
              <div className="container">
                <div className="results-hero-content">
                  <div className="breadcrumb-nav">
                    <span className="breadcrumb-link" onClick={() => navigateTo('home', 'home')}>首頁</span>
                    <span className="breadcrumb-separator">/</span>
                    <span className="breadcrumb-current">🏆 得獎名單及成績</span>
                  </div>
                  <div className="results-badge">2026 HSPC 全國高中職程式設計競賽</div>
                  <h1 className="results-main-title">
                    <span>得獎名單</span> 及 競賽成績
                  </h1>
                  <p className="results-subtitle">
                    恭喜所有獲獎隊伍與參賽同學！感謝指導老師及各校熱情參與！
                  </p>
                  <div className="results-meta-bar">
                    <span className="results-meta-item">📅 公告日期：{data.results?.publishDate || '2026-08-26'}</span>
                    <span className="results-meta-item">🏫 競賽地點：靜宜大學 主顧樓</span>
                    <span className="results-meta-item">💻 評測規則：ICPC 競賽規則</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Certificate Delivery Notice Banner (重要通知) */}
            <section className="cert-notice-section">
              <div className="container">
                <div className="cert-notice-card">
                  <div className="cert-notice-icon-box">
                    <span className="cert-notice-icon">📜</span>
                  </div>
                  <div className="cert-notice-content">
                    <div className="cert-notice-tag">獎狀寄送重要通知</div>
                    <h2 className="cert-notice-title">
                      {data.results?.certificateNotice || '獎狀將另行以紙本寄送，預計 7 個工作天。'}
                    </h2>
                    <p className="cert-notice-desc">
                      {data.results?.certificateDetails || '感謝各校師生與指導老師的熱情參與！本屆競賽獎狀將另行以紙本公文方式寄送至各校教務處/指導單位，預計於 7 個工作天內寄達，請獲獎隊伍留意收件。'}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {isAnnounced ? (
              <>
                {/* Awards Showcase (金獎、銀獎、銅獎、佳作) */}
                <section className="section-wrapper" style={{ paddingTop: '40px' }}>
                  <div className="container">
                    <div className="section-header">
                      <h2 className="section-title">🏆 榮譽得獎名單</h2>
                      <p className="section-desc">表彰在 2026 HSPC 中表現卓越的優秀隊伍</p>
                    </div>

                    {/* Top 3 Podium Cards */}
                    <div className="podium-grid">
                      {podiumAwards.map((item) => (
                        <div
                          key={item.rank}
                          className={`podium-card podium-rank-${item.rank} ${item.award ? `podium-award-${item.award}` : ''} ${item.rank === 1 ? 'podium-first' : ''}`}
                        >
                          <div className="podium-crown">
                            <span className="podium-medal">{item.awardIcon}</span>
                          </div>
                          <div className="podium-award-badge">{item.award}</div>
                          <div className="podium-team-no">{item.teamNo}</div>
                          <h3 className="podium-team-name">{item.teamName}</h3>
                          <div className="podium-school">{item.school}</div>
                          <div className="podium-prize">
                            <span className="prize-label">獲獎獎金</span>
                            <span className="prize-amount">{item.prize}</span>
                          </div>
                          <div className="podium-stats">
                            <div className="podium-stat-box">
                              <span className="stat-value">{item.solved} 題</span>
                              <span className="stat-label">解題數</span>
                            </div>
                            <div className="podium-stat-box">
                              <span className="stat-value">{item.penalty} 分</span>
                              <span className="stat-label">總罰時</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Honorable Mentions Grid */}
                    {honorableAwards.length > 0 && (
                      <div className="honorable-section">
                        <h3 className="honorable-section-title">🎖️ 佳作獲獎隊伍</h3>
                        <div className="honorable-grid">
                          {honorableAwards.map((item) => (
                            <div key={item.rank} className="honorable-card">
                              <div className="honorable-header">
                                <span className="honorable-badge">{item.awardIcon} {item.award}</span>
                                <span className="honorable-no">{item.teamNo}</span>
                              </div>
                              <h4 className="honorable-team">{item.teamName}</h4>
                              <div className="honorable-school">{item.school}</div>
                              <div className="honorable-footer">
                                <span className="honorable-prize">{item.prize}</span>
                                <span className="honorable-stats">解題 {item.solved} 題 ({item.penalty}分)</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </section>

                {/* Scoreboard Table Section */}
                <section className="section-wrapper" style={{ backgroundColor: 'var(--bg-primary)' }}>
                  <div className="container">
                    <div className="scoreboard-header-bar">
                      <div>
                        <h2 className="section-title">📊 完整競賽成績榜 (Scoreboard)</h2>
                        <p className="section-desc">包含全體參賽隊伍排名、解題數、總罰時與各題通過狀況</p>
                      </div>
                      <div className="scoreboard-search-box">
                        <span className="search-icon">🔍</span>
                        <input
                          type="text"
                          placeholder="搜尋隊名、學校或組別..."
                          value={scoreboardFilter}
                          onChange={(e) => setScoreboardFilter(e.target.value)}
                          className="scoreboard-search-input"
                        />
                        {scoreboardFilter && (
                          <button
                            onClick={() => setScoreboardFilter('')}
                            className="search-clear-btn"
                            title="清除搜尋"
                          >
                            &times;
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Scoreboard Table */}
                    <div className="scoreboard-table-wrapper">
                      <table className="scoreboard-table">
                        <thead>
                          <tr>
                            <th style={{ width: '70px', textAlign: 'center' }}>名次</th>
                            <th style={{ width: '100px', textAlign: 'center' }}>獎項</th>
                            <th style={{ width: '80px', textAlign: 'center' }}>組別</th>
                            <th style={{ minWidth: '160px' }}>隊伍名稱</th>
                            <th style={{ minWidth: '180px' }}>就讀學校</th>
                            <th style={{ width: '80px', textAlign: 'center' }}>解題數</th>
                            <th style={{ width: '90px', textAlign: 'center' }}>總罰時</th>
                            {data.results?.problemsList?.map((prob) => (
                              <th key={prob} style={{ width: '65px', textAlign: 'center' }}>
                                {prob} 題
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {filteredScoreboard.map((row) => (
                            <tr
                              key={row.rank}
                              className={`scoreboard-row ${row.rank <= 3 ? `top-row top-row-${row.rank}` : ''}`}
                            >
                              <td style={{ textAlign: 'center' }}>
                                <span className={`rank-badge rank-${row.rank}`}>
                                  {row.rank === 1 ? '🥇 1' : row.rank === 2 ? '🥈 2' : row.rank === 3 ? '🥉 3' : row.rank}
                                </span>
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                <span className={`award-pill award-${row.award}`}>
                                  {row.award}
                                </span>
                              </td>
                              <td style={{ textAlign: 'center', fontWeight: '600', color: 'var(--primary-navy)' }}>
                                {row.teamNo}
                              </td>
                              <td style={{ fontWeight: '700', color: 'var(--text-primary)' }}>
                                {row.teamName}
                              </td>
                              <td style={{ color: 'var(--text-secondary)' }}>
                                {row.school}
                              </td>
                              <td style={{ textAlign: 'center', fontWeight: '800', color: 'var(--primary-navy)', fontSize: '1.05rem' }}>
                                {row.solved}
                              </td>
                              <td style={{ textAlign: 'center', color: 'var(--text-secondary)', fontFamily: 'var(--font-display)' }}>
                                {row.penalty}
                              </td>
                              {data.results?.problemsList?.map((prob) => {
                                const pStatus = row.problems?.[prob]
                                return (
                                  <td key={prob} style={{ textAlign: 'center' }}>
                                    {pStatus ? (
                                      pStatus.solved ? (
                                        <div className="prob-status prob-ac" title={`通過時間：${pStatus.time} 分鐘，送交 ${pStatus.tries} 次`}>
                                          <span className="prob-symbol">+</span>
                                          <span className="prob-detail">{pStatus.time} ({pStatus.tries})</span>
                                        </div>
                                      ) : pStatus.tries > 0 ? (
                                        <div className="prob-status prob-wa" title={`未通過，已送交 ${pStatus.tries} 次`}>
                                          <span className="prob-symbol">-</span>
                                          <span className="prob-detail">({pStatus.tries})</span>
                                        </div>
                                      ) : (
                                        <span className="prob-empty">·</span>
                                      )
                                    ) : (
                                      <span className="prob-empty">·</span>
                                    )}
                                  </td>
                                )
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {filteredScoreboard.length === 0 && (
                      <div className="scoreboard-empty-search">
                        <span>🔍 沒有找到符合「{scoreboardFilter}」的參賽隊伍</span>
                      </div>
                    )}

                    {/* Scoreboard Legend */}
                    <div className="scoreboard-legend">
                      <span className="legend-title">圖例說明：</span>
                      <div className="legend-items">
                        <div className="legend-item">
                          <span className="prob-status prob-ac" style={{ display: 'inline-flex', padding: '2px 8px', fontSize: '0.75rem' }}>+ 18 (1)</span>
                          <span>解題通過（通過時間 / 送交次數）</span>
                        </div>
                        <div className="legend-item">
                          <span className="prob-status prob-wa" style={{ display: 'inline-flex', padding: '2px 8px', fontSize: '0.75rem' }}>- (2)</span>
                          <span>嘗試未通過（送交次數）</span>
                        </div>
                        <div className="legend-item">
                          <span className="prob-empty" style={{ fontSize: '1.2rem', lineHeight: '1' }}>·</span>
                          <span>未嘗試解題</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </>
            ) : (
              /* PENDING / UNANNOUNCED VIEW */
              <>
                {/* Status Notice Box */}
                <section className="section-wrapper" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
                  <div className="container">
                    <div className="pending-status-card">
                      <div className="pending-icon-circle">
                        <span className="pending-icon">⏳</span>
                      </div>
                      <div className="pending-tag">賽事成績審查中</div>
                      <h2 className="pending-title">得獎名單與競賽成績統計評定中</h2>
                      <p className="pending-desc">
                        {data.results?.statusMessage || '2026 HSPC 競賽成績與得獎名單目前正由評審委員會統計審核中，將於評審會議結束後正式公佈，敬請期待！'}
                      </p>
                      <div className="pending-schedule-info">
                        <span>🕒 評審會議時間：8/26 (三) 16:30 - 16:50</span>
                        <span>🏆 頒獎典禮時間：8/26 (三) 16:50 - 17:30</span>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Teams Roster List */}
                <section className="section-wrapper" style={{ backgroundColor: 'var(--bg-primary)', paddingTop: '40px', paddingBottom: '40px' }}>
                  <div className="container">
                    <div className="scoreboard-header-bar">
                      <div>
                        <h2 className="section-title">📋 參賽組別清單</h2>
                        <p className="section-desc">2026 HSPC 全體參賽隊伍一覽（共 {data.results?.teamsList?.length || 9} 組）</p>
                      </div>
                      <div className="scoreboard-search-box">
                        <span className="search-icon">🔍</span>
                        <input
                          type="text"
                          placeholder="搜尋隊名、學校或組別..."
                          value={scoreboardFilter}
                          onChange={(e) => setScoreboardFilter(e.target.value)}
                          className="scoreboard-search-input"
                        />
                        {scoreboardFilter && (
                          <button
                            onClick={() => setScoreboardFilter('')}
                            className="search-clear-btn"
                            title="清除搜尋"
                          >
                            &times;
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="scoreboard-table-wrapper" style={{ maxWidth: '900px', margin: '0 auto' }}>
                      <table className="scoreboard-table">
                        <thead>
                          <tr>
                            <th style={{ width: '90px', textAlign: 'center' }}>組別編號</th>
                            <th>隊伍名稱</th>
                            <th>就讀學校</th>
                            <th style={{ width: '130px', textAlign: 'center' }}>目前狀態</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredTeamsList.map((team) => (
                            <tr key={team.teamNo} className="scoreboard-row">
                              <td style={{ textAlign: 'center', fontWeight: '700', color: 'var(--primary-navy)' }}>
                                {team.teamNo}
                              </td>
                              <td style={{ fontWeight: '700', color: 'var(--text-primary)' }}>
                                {team.teamName}
                              </td>
                              <td style={{ color: 'var(--text-secondary)' }}>
                                {team.school}
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                <span className="award-pill" style={{ background: '#fef3c7', color: '#92400e', border: '1px solid #f59e0b' }}>
                                  ⏳ 評定審核中
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {filteredTeamsList.length === 0 && (
                      <div className="scoreboard-empty-search" style={{ maxWidth: '900px', margin: '0 auto' }}>
                        <span>🔍 沒有找到符合「{scoreboardFilter}」的參賽隊伍</span>
                      </div>
                    )}

                    {/* Classroom Seating Map (組別座位平面分佈圖) */}
                    <div className="seating-map-container" style={{ maxWidth: '900px', margin: '40px auto 0 auto' }}>
                      <div className="seating-map-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '1.4rem' }}>🏫</span>
                          <h3 style={{ margin: 0, fontSize: '1.3rem', color: 'var(--primary-navy)', fontWeight: '800' }}>
                            主顧 316 電腦教室 組別座位分佈圖 (S01~S09 組)
                          </h3>
                        </div>
                        <span className="seating-map-loc-badge">
                          📍 靜宜大學 主顧樓 3 樓
                        </span>
                      </div>

                      <div className="seating-map-card">
                        <div className="classroom-podium-area">
                          <div className="classroom-door">🚪 前門（入口）</div>
                          <div className="teacher-desk">👨‍🏫 老師 / 監考席</div>
                        </div>

                        <div className="classroom-direction-bar">
                          <span>👈 左側座位區</span>
                          <span>─── 由左而右（面向講台視角）───</span>
                          <span>右側座位區 👉</span>
                        </div>

                        <div className="classroom-grid">
                          {(data.results?.seatingChart?.rows || [
                            { row: 1, type: "generic", label: "第 1 排", desc: "預備席" },
                            { row: 2, type: "teams", label: "第 2 排", teamNos: ["S01", "S02", "S03"] },
                            { row: 3, type: "teams", label: "第 3 排", teamNos: ["S04", "S05", "S06"] },
                            { row: 4, type: "teams", label: "第 4 排", teamNos: ["S07", "S08", "S09"] },
                            { row: 5, type: "generic", label: "第 5 排", desc: "預備席" }
                          ]).map((rowItem, rIdx) => (
                            <div
                              key={rIdx}
                              className={`classroom-row ${rowItem.type === 'generic' ? 'generic-row' : 'team-row'}`}
                            >
                              <div className="row-label">{rowItem.label}</div>
                              {rowItem.type === 'generic' ? (
                                <div className="generic-seats-box">
                                  <span>{rowItem.desc}</span>
                                </div>
                              ) : (
                                <div className="team-seats-flex">
                                  {rowItem.teamNos.map((tNo) => {
                                    const team = teamByNo[tNo]
                                    return (
                                      <div key={tNo} className={`seat-team-card ${tNo.toLowerCase()}`}>
                                        <div className="seat-team-top">
                                          <span className="seat-tag">{tNo}</span>
                                        </div>
                                        <div className="seat-team-title" title={team?.teamName || tNo}>
                                          {team?.teamName || tNo}
                                        </div>
                                        <div className="seat-team-sub">
                                          {team?.school || ''}
                                        </div>
                                      </div>
                                    )
                                  })}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>

                        <div className="seating-map-footer">
                          <span>💡 競賽規則：每組 3 位選手於指定組別座位入座，每隊共用 1 部承辦單位提供之電腦進行競賽解題。</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Awards & Prizes Overview Card */}
                <section className="section-wrapper" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
                  <div className="container">
                    <div className="section-header">
                      <h2 className="section-title">🎁 本屆競賽獎項與獎額</h2>
                      <p className="section-desc">競賽結果將擇優頒發以下榮譽獎項</p>
                    </div>

                    <div className="prizes-overview-grid">
                      <div className="prize-overview-card gold">
                        <div className="prize-badge-icon">🥇</div>
                        <div className="prize-tier-name">第一名 (金獎)</div>
                        <div className="prize-quota">錄取 1 隊</div>
                        <div className="prize-amount-highlight">新台幣 12,000 元</div>
                        <div className="prize-sub">每隊頒發獎金及教育部/主辦單位紙本獎狀</div>
                      </div>

                      <div className="prize-overview-card silver">
                        <div className="prize-badge-icon">🥈</div>
                        <div className="prize-tier-name">第二名 (銀獎)</div>
                        <div className="prize-quota">錄取 1 隊</div>
                        <div className="prize-amount-highlight">新台幣 9,000 元</div>
                        <div className="prize-sub">每隊頒發獎金及主辦單位紙本獎狀</div>
                      </div>

                      <div className="prize-overview-card bronze">
                        <div className="prize-badge-icon">🥉</div>
                        <div className="prize-tier-name">第三名 (銅獎)</div>
                        <div className="prize-quota">錄取 1 隊</div>
                        <div className="prize-amount-highlight">新台幣 6,000 元</div>
                        <div className="prize-sub">每隊頒發獎金及主辦單位紙本獎狀</div>
                      </div>

                      <div className="prize-overview-card mention">
                        <div className="prize-badge-icon">🎖️</div>
                        <div className="prize-tier-name">佳作組別</div>
                        <div className="prize-quota">錄取 5 組</div>
                        <div className="prize-amount-highlight">每組 新台幣 3,000 元</div>
                        <div className="prize-sub">每隊頒發獎金及主辦單位紙本獎狀</div>
                      </div>
                    </div>
                  </div>
                </section>
              </>
            )}

            {/* Rules and Scoring Note Card */}
            <section className="section-wrapper" style={{ borderBottom: 'none' }}>
              <div className="container">
                <div className="news-card" style={{ maxWidth: '900px', margin: '0 auto' }}>
                  <h3 className="news-card-title" style={{ color: 'var(--primary-navy)', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                    ℹ️ 競賽評分與給獎規則說明
                  </h3>
                  <ul className="bullet-list" style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <li><strong>評定名次標準：</strong>採用 ICPC 國際標準評分方式，參賽隊伍以答對題數多者為優先；答對題數相同時，以答對題目耗費之時間總和（含每次答錯罰時 20 分鐘）較少者為優勝。</li>
                    <li><strong>獲獎名額與獎金：</strong>金獎頒發 12,000 元（1隊）、銀獎 9,000 元（1隊）、銅獎 6,000 元（1隊）、佳作各 3,000 元（5隊）。</li>
                    <li><strong>獎狀紙本寄送：</strong>{data.results?.certificateNotice || '獎狀將另行以紙本寄送，預計 7 個工作天。'}（由主辦單位函寄至各參賽學校教務處或指導老師）。</li>
                  </ul>
                  <div style={{ marginTop: '24px', textAlign: 'center' }}>
                    <button
                      onClick={() => navigateTo('home', 'home')}
                      className="btn btn-primary"
                      style={{ padding: '12px 28px', fontSize: '1rem' }}
                    >
                      ← 返回競賽首頁
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}
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
          <div className="footer-developer">
            <span>網頁開發與維護：</span>
            <a href="https://github.com/archie0732" target="_blank" rel="noopener noreferrer">
              archie0732 (GitHub)
            </a>
            <span style={{ opacity: 0.4 }}>|</span>
            <span>專案 GitHub 倉庫：</span>
            <a href="https://github.com/archie0732/hspc2026" target="_blank" rel="noopener noreferrer">
              archie0732/hspc2026
            </a>
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

      {/* Floating Toast Notification */}
      {toast.show && (
        <div className={`admin-toast-banner ${toast.type}`}>
          <div className="admin-toast-content">
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Admin Password Authentication Modal */}
      {isPasswordModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsPasswordModalOpen(false)}>
          <div className="admin-modal-dialog pwd-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.3rem' }}>🔒</span>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--primary-navy)' }}>管理員身份驗證</h3>
              </div>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setIsPasswordModalOpen(false)}
                title="關閉"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handlePasswordSubmit} className="admin-modal-body">
              <p style={{ margin: '0 0 16px 0', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                線上修改成績與發布需要管理權限，請輸入管理員密碼：
              </p>
              <div style={{ marginBottom: '16px' }}>
                <input
                  type="password"
                  className="admin-input"
                  placeholder="請輸入管理密碼"
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value)
                    setPasswordError('')
                  }}
                  autoFocus
                />
                {passwordError && (
                  <div style={{ color: '#dc2626', fontSize: '0.85rem', marginTop: '8px', fontWeight: '700' }}>
                    {passwordError}
                  </div>
                )}
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="btn btn-cancel" onClick={() => setIsPasswordModalOpen(false)}>
                  取消
                </button>
                <button type="submit" className="btn btn-primary">
                  🔓 解鎖進入後台
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Results & Awards Management Modal */}
      {isAdminModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsAdminModalOpen(false)}>
          <div className="admin-modal-dialog large-modal" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="admin-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.5rem' }}>⚙️</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--primary-navy)' }}>
                    2026 HSPC 成績與得獎名單線上管理後台
                  </h3>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    即時調整各名次獲獎隊伍、刪除或新增佳作，並可一鍵複製 JSON 發布至 GitHub
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button type="button" className="btn-logout" onClick={handleAdminLogout} title="登出管理員">
                  🚪 登出
                </button>
                <button
                  type="button"
                  className="admin-modal-close"
                  onClick={() => setIsAdminModalOpen(false)}
                  title="關閉視窗"
                >
                  &times;
                </button>
              </div>
            </div>

            {/* Scrollable Body */}
            <div className="admin-modal-body admin-scrollable">
              {/* Section 1: 公佈狀態切換 */}
              <div className="admin-section-box">
                <div className="admin-section-header">
                  <h4 style={{ margin: 0 }}>🎛️ 成績公佈狀態切換</h4>
                </div>
                <div className="admin-toggle-wrapper">
                  <div className={`admin-status-indicator ${adminFormData.isAnnounced ? 'status-published' : 'status-pending'}`}>
                    <span className="status-dot"></span>
                    <span>
                      {adminFormData.isAnnounced
                        ? '🟢 目前狀態：正式公佈中（前台公開金銀銅得獎台與完整成績排行榜）'
                        : '🔴 目前狀態：待公佈（前台僅顯示成績審定中提示、組別名單與座位表）'}
                    </span>
                  </div>
                  <button
                    type="button"
                    className={`btn-toggle-announce ${adminFormData.isAnnounced ? 'btn-toggle-unpublish' : 'btn-toggle-publish'}`}
                    onClick={handleToggleAnnounce}
                  >
                    {adminFormData.isAnnounced ? '🔒 切換為「待公佈 (隱藏成績)」' : '📢 切換為「正式公佈 (公開成績)」'}
                  </button>
                </div>
              </div>

              {/* Section 2: 得獎名單管理 */}
              <div className="admin-section-box">
                <div className="admin-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <h4 style={{ margin: 0 }}>🏅 獲獎名冊與名次管理（共 {adminFormData.awards.length} 組）</h4>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      可使用「快速帶入」直接指派參賽隊伍，或自由刪除多餘的佳作項目。
                    </span>
                  </div>
                  <button type="button" className="btn-add-award" onClick={handleAddAward}>
                    ➕ 新增獲獎 / 佳作名額
                  </button>
                </div>

                <div className="admin-awards-list">
                  {adminFormData.awards.map((item, idx) => (
                    <div key={idx} className={`admin-award-card rank-${item.rank <= 3 ? item.rank : 'other'}`}>
                      <div className="admin-award-card-header">
                        <div className="award-rank-pill">
                          <span className="award-rank-num">第 {item.rank} 名</span>
                          <select
                            className="admin-select-sm"
                            value={item.award}
                            onChange={(e) => {
                              const val = e.target.value
                              let icon = '🎖️'
                              if (val === '金獎') icon = '🥇'
                              else if (val === '銀獎') icon = '🥈'
                              else if (val === '銅獎') icon = '🥉'
                              else if (val === '參賽證明') icon = '🏅'
                              handleUpdateAward(idx, 'award', val)
                              handleUpdateAward(idx, 'awardIcon', icon)
                            }}
                          >
                            <option value="金獎">🥇 金獎</option>
                            <option value="銀獎">🥈 銀獎</option>
                            <option value="銅獎">🥉 銅獎</option>
                            <option value="佳作">🎖️ 佳作</option>
                            <option value="參賽證明">🏅 參賽證明</option>
                            <option value="特別獎">🌟 特別獎</option>
                          </select>
                        </div>

                        <div className="award-card-actions">
                          <button
                            type="button"
                            className="btn-delete-award"
                            onClick={() => handleDeleteAward(idx)}
                            title="刪除此得獎/佳作項目"
                          >
                            🗑️ 刪除此項目
                          </button>
                        </div>
                      </div>

                      <div className="admin-award-grid">
                        {/* Quick Team Select */}
                        <div className="admin-field-group span-2">
                          <label>⚡ 快速帶入參賽隊伍：</label>
                          <select
                            className="admin-select"
                            value={item.teamNo || ''}
                            onChange={(e) => handleSelectTeam(idx, e.target.value)}
                          >
                            <option value="">-- 請選擇參賽隊伍 (S01~S09) --</option>
                            {data.results?.teamsList?.map((t) => (
                              <option key={t.teamNo} value={t.teamNo}>
                                {t.teamNo} - {t.teamName} ({t.school})
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Team No */}
                        <div className="admin-field-group">
                          <label>組別編號：</label>
                          <input
                            type="text"
                            className="admin-input"
                            value={item.teamNo || ''}
                            placeholder="如: S01"
                            onChange={(e) => handleUpdateAward(idx, 'teamNo', e.target.value)}
                          />
                        </div>

                        {/* Team Name */}
                        <div className="admin-field-group">
                          <label>隊伍名稱：</label>
                          <input
                            type="text"
                            className="admin-input"
                            value={item.teamName || ''}
                            placeholder="隊伍名稱"
                            onChange={(e) => handleUpdateAward(idx, 'teamName', e.target.value)}
                          />
                        </div>

                        {/* School */}
                        <div className="admin-field-group">
                          <label>就讀學校：</label>
                          <input
                            type="text"
                            className="admin-input"
                            value={item.school || ''}
                            placeholder="學校名稱"
                            onChange={(e) => handleUpdateAward(idx, 'school', e.target.value)}
                          />
                        </div>

                        {/* Prize */}
                        <div className="admin-field-group">
                          <label>獲得獎額：</label>
                          <input
                            type="text"
                            className="admin-input"
                            value={item.prize || ''}
                            placeholder="如: 新台幣 12,000 元"
                            onChange={(e) => handleUpdateAward(idx, 'prize', e.target.value)}
                          />
                        </div>

                        {/* Solved Count */}
                        <div className="admin-field-group">
                          <label>解題數 (題)：</label>
                          <input
                            type="number"
                            min="0"
                            max="10"
                            className="admin-input"
                            value={item.solved ?? 0}
                            onChange={(e) => handleUpdateAward(idx, 'solved', Number(e.target.value))}
                          />
                        </div>

                        {/* Penalty */}
                        <div className="admin-field-group">
                          <label>總罰時 (分鐘)：</label>
                          <input
                            type="number"
                            min="0"
                            className="admin-input"
                            value={item.penalty ?? 0}
                            onChange={(e) => handleUpdateAward(idx, 'penalty', Number(e.target.value))}
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  {adminFormData.awards.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)' }}>
                      尚未加入任何獲獎項目，請點擊上方「➕ 新增獲獎 / 佳作名額」按鈕建立。
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="admin-modal-footer-bar">
              <div className="footer-left-actions">
                <button type="button" className="btn-action-copy" onClick={handleCopyJson} title="複製 JSON 用於更新 GitHub 倉庫">
                  📋 一鍵複製 JSON (發布 GitHub)
                </button>
                <button type="button" className="btn-action-download" onClick={handleDownloadJson} title="下載 JSON 檔案">
                  📥 下載 JSON
                </button>
                <button type="button" className="btn-action-reset" onClick={handleResetDefault} title="恢復為預設資料">
                  🔄 恢復預設值
                </button>
              </div>

              <div className="footer-right-actions">
                <button type="button" className="btn btn-cancel" onClick={() => setIsAdminModalOpen(false)}>
                  關閉視窗
                </button>
                <button type="button" className="btn btn-primary btn-action-save" onClick={handleSaveAdmin}>
                  💾 儲存並即時套用
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default App
