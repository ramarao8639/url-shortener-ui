import { useEffect, useState } from "react";

import {
  createShortUrl,
  deleteUrl,
  getAllUrls,
  type UrlResponse,
  type CloudProvider,
} from "./services/urlApi";

import "./App.css";

function App() {
  const [urls, setUrls] = useState<UrlResponse[]>([]);
  const [originalUrl, setOriginalUrl] = useState("");

  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  const [error, setError] = useState("");

  const [createdUrl, setCreatedUrl] =
    useState<UrlResponse | null>(null);

  const [cloud, setCloud] =
    useState<CloudProvider>("gcp");

  const loadUrls = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAllUrls(cloud);

      setUrls(data);
    } catch (err) {
      setError(
        `Unable to load URLs from ${cloud.toUpperCase()}`
      );

      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUrls();
  }, [cloud]);

  const handleCloudChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectedCloud =
      e.target.value as CloudProvider;

    setCloud(selectedCloud);

    setCreatedUrl(null);
    setUrls([]);
    setError("");
  };

  const handleCreateUrl = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!originalUrl.trim()) {
      setError("Please enter a valid URL");
      return;
    }

    try {
      setCreating(true);
      setError("");
      setCreatedUrl(null);

      const newUrl =
        await createShortUrl(
          cloud,
          originalUrl
        );

      setCreatedUrl(newUrl);

      setOriginalUrl("");

      await loadUrls();
    } catch (err) {
      setError(
        `Unable to create short URL on ${cloud.toUpperCase()}`
      );

      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (
    shortCode: string
  ) => {
    const confirmed = window.confirm(
      `Delete short URL "${shortCode}" from ${cloud.toUpperCase()}?`
    );

    if (!confirmed) return;

    try {
      setError("");

      await deleteUrl(
        cloud,
        shortCode
      );

      setUrls((currentUrls) =>
        currentUrls.filter(
          (url) =>
            url.shortCode !== shortCode
        )
      );
    } catch (err) {
      setError(
        `Unable to delete URL from ${cloud.toUpperCase()}`
      );

      console.error(err);
    }
  };

  const copyUrl = async (
    url: string
  ) => {
    try {
      await navigator.clipboard.writeText(url);

      alert("Short URL copied!");
    } catch {
      setError("Unable to copy URL");
    }
  };

  const totalClicks = urls.reduce(
    (total, url) =>
      total + (url.clickCount || 0),
    0
  );

  const cloudName =
    cloud === "gcp"
      ? "Google Cloud"
      : "AWS EKS";

  return (
    <div className="app">

      {/* NAVBAR */}

      <nav className="navbar">

        <div className="logo">
          <span className="logo-icon">
            ⚡
          </span>

          URL Shortener
        </div>

        <div className="nav-status">
          <span className="status-dot" />

          {cloudName}
        </div>

      </nav>


      <main className="main">

        {/* HERO */}

        <section className="hero">

          <div className="badge">
            <span />

            Powered by Kubernetes
          </div>

          <h1>
            Short links.
            <br />

            <span>
              Big performance.
            </span>
          </h1>

          <p>
            A multi-cloud URL shortener powered by
            Spring Boot, PostgreSQL, Redis and Kubernetes.
          </p>

        </section>


        {/* DASHBOARD */}

        <section className="dashboard-stats">

          <div className="dashboard-card">

            <div className="dashboard-icon">
              🔗
            </div>

            <div>
              <span>Total Links</span>

              <h2>
                {urls.length}
              </h2>
            </div>

          </div>


          <div className="dashboard-card">

            <div className="dashboard-icon">
              📊
            </div>

            <div>
              <span>Total Clicks</span>

              <h2>
                {totalClicks}
              </h2>
            </div>

          </div>


          <div className="dashboard-card">

            <div className="dashboard-icon online-icon">
              ●
            </div>

            <div>
              <span>
                System Status
              </span>

              <h2 className="online">
                Online
              </h2>
            </div>

          </div>

        </section>


        {/* SHORTENER */}

        <section className="shortener-card">

          <h2 className="card-title">
            Create Short URL
          </h2>

          <p className="card-subtitle">
            Choose your cloud infrastructure and
            create a short URL instantly.
          </p>


          <form
            onSubmit={handleCreateUrl}
          >

            {/* CLOUD SELECTOR */}

            <div className="input-group">

              <label htmlFor="cloud">
                Select Cloud Provider
              </label>

              <select
                id="cloud"
                value={cloud}
                onChange={handleCloudChange}
              >

                <option value="gcp">
                  ☁ Google Cloud
                </option>

                <option value="aws">
                  ☁ AWS EKS
                </option>

              </select>

            </div>


            {/* URL INPUT */}

            <div className="input-group">

              <label htmlFor="originalUrl">
                Enter your long URL
              </label>

              <input
                id="originalUrl"
                type="url"
                placeholder="https://example.com/very-long-url"
                value={originalUrl}
                onChange={(e) =>
                  setOriginalUrl(
                    e.target.value
                  )
                }
              />

            </div>


            {/* BUTTON */}

            <button
              type="submit"
              className="shorten-button"
              disabled={creating}
            >

              {creating
                ? `Creating on ${cloudName}...`
                : `Shorten URL on ${cloudName} →`
              }

            </button>

          </form>


          {/* ERROR */}

          {error && (

            <div className="error-message">
              {error}
            </div>

          )}


          {/* RESULT */}

          {createdUrl && (

            <div className="result-card">

              <div className="success-header">

                <div className="success-icon">
                  ✓
                </div>

                <div>

                  <h3>
                    Short URL created!
                  </h3>

                  <p>
                    Created successfully on {cloudName}.
                  </p>

                </div>

              </div>


              <div className="short-url-container">

                <a
                  href={createdUrl.shortUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  {createdUrl.shortUrl}
                </a>


                <button
                  type="button"
                  onClick={() =>
                    copyUrl(
                      createdUrl.shortUrl
                    )
                  }
                >
                  Copy
                </button>

              </div>


              <div className="stats">

                <div className="stat">

                  <span className="stat-label">
                    SHORT CODE
                  </span>

                  <span className="stat-value">
                    {createdUrl.shortCode}
                  </span>

                </div>


                <div className="stat">

                  <span className="stat-label">
                    CLICKS
                  </span>

                  <span className="stat-value">
                    {createdUrl.clickCount}
                  </span>

                </div>


                <div className="stat">

                  <span className="stat-label">
                    CLOUD
                  </span>

                  <span className="stat-value online">
                    {cloudName}
                  </span>

                </div>

              </div>

            </div>

          )}

        </section>


        {/* URL LIST */}

        <section className="urls-section">

          <div className="section-header">

            <div>

              <h2>
                My URLs
              </h2>

              <p>
                Showing URLs from {cloudName}.
              </p>

            </div>


            <button
              className="refresh-button"
              onClick={loadUrls}
              disabled={loading}
            >

              {loading
                ? "Loading..."
                : "↻ Refresh"
              }

            </button>

          </div>


          {loading &&
          urls.length === 0 ? (

            <div className="empty-state">
              Loading URLs from {cloudName}...
            </div>

          ) : urls.length === 0 ? (

            <div className="empty-state">

              <div className="empty-icon">
                🔗
              </div>

              <h3>
                No URLs yet
              </h3>

              <p>
                Create your first short URL
                on {cloudName}.
              </p>

            </div>

          ) : (

            <div className="url-list">

              {urls.map((url) => (

                <div
                  className="url-item"
                  key={url.shortCode}
                >

                  <div className="url-info">

                    <div className="url-main">

                      <a
                        className="short-link"
                        href={url.shortUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {url.shortUrl}
                      </a>


                      <span className="click-badge">
                        👆 {url.clickCount} clicks
                      </span>

                    </div>


                    <p className="original-link">
                      {url.originalUrl}
                    </p>


                    <span className="created-date">

                      Created:{" "}

                      {new Date(
                        url.createdAt
                      ).toLocaleString()}

                    </span>

                  </div>


                  <div className="url-actions">

                    <button
                      className="action-button"
                      title="Copy URL"
                      onClick={() =>
                        copyUrl(url.shortUrl)
                      }
                    >
                      📋
                    </button>


                    <a
                      className="action-button open-button"
                      href={url.shortUrl}
                      target="_blank"
                      rel="noreferrer"
                      title="Open short URL"
                    >
                      ↗
                    </a>


                    <button
                      className="action-button delete-button"
                      title="Delete URL"
                      onClick={() =>
                        handleDelete(
                          url.shortCode
                        )
                      }
                    >
                      🗑
                    </button>

                  </div>

                </div>

              ))}

            </div>

          )}

        </section>


        {/* ARCHITECTURE */}

        <section className="architecture">

          <h2>
            Multi-Cloud Architecture
          </h2>


          <div className="architecture-grid">

            <div className="tech-card">

              <div className="tech-icon">
                ☕
              </div>

              <h3>
                Spring Boot
              </h3>

              <p>
                REST API & business logic
              </p>

            </div>


            <div className="tech-card">

              <div className="tech-icon">
                🐘
              </div>

              <h3>
                PostgreSQL
              </h3>

              <p>
                Persistent URL storage
              </p>

            </div>


            <div className="tech-card">

              <div className="tech-icon">
                ⚡
              </div>

              <h3>
                Redis
              </h3>

              <p>
                High-speed caching
              </p>

            </div>


            <div className="tech-card">

              <div className="tech-icon">
                ☸
              </div>

              <h3>
                Kubernetes
              </h3>

              <p>
                GCP & AWS EKS deployment
              </p>

            </div>

          </div>

        </section>

      </main>


      <footer>
        Built with React • Spring Boot • PostgreSQL • Redis • Kubernetes • GCP • AWS
      </footer>

    </div>
  );
}

export default App;