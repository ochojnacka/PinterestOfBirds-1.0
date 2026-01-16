import './MainContent.css'

function MainContent({ data }) {
  return (
    <main className="main-content">
      <div className="content-container">
        <h2>Welcome to Pinterest of Birds</h2>
        {data && (
          <div className="api-status">
            <p>✅ {data.message}</p>
          </div>
        )}
        <div className="features">
          <div className="feature-card">
            <h3>🐦 Bird Collection</h3>
            <p>Discover and save your favorite bird images</p>
          </div>
          <div className="feature-card">
            <h3>☁️ Cloud Storage</h3>
            <p>Powered by AWS S3 for reliable image storage</p>
          </div>
          <div className="feature-card">
            <h3>🔐 Secure Access</h3>
            <p>Protected with AWS Cognito authentication</p>
          </div>
        </div>
      </div>
    </main>
  )
}

export default MainContent
