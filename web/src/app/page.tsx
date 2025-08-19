export default function Home() {
  return (
    <html>
      <body>
        <div style={{padding: '20px', fontSize: '24px', color: 'red'}}>
          <h1>🚀 SIMPLE TEST PAGE WORKING!</h1>
          <p>Deployment time: {new Date().toISOString()}</p>
          <p>If you see this, Next.js routing is working!</p>
        </div>
      </body>
    </html>
  );
}
