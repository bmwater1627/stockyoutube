document.addEventListener('DOMContentLoaded', () => {
  const analyzeBtn = document.getElementById('analyze-btn');
  const loader = document.getElementById('loader');
  const resultsContainer = document.getElementById('results-container');

  analyzeBtn.addEventListener('click', async () => {
    // 1. Set initial state
    analyzeBtn.disabled = true;
    loader.classList.remove('hidden');
    resultsContainer.innerHTML = '';

    try {
      // 2. Fetch data from the backend API
      // This URL assumes the backend server is running locally on port 3000
      const response = await fetch('http://localhost:3000/api/analyze');

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // 3. Render the results
      if (data.summaries && data.summaries.length > 0) {
        renderSummaries(data.summaries);
      } else {
        resultsContainer.innerHTML = '<p>분석할 영상을 찾지 못했거나, 요약에 실패했습니다.</p>';
      }

    } catch (error) {
      console.error('Error fetching or rendering analysis:', error);
      resultsContainer.innerHTML = `<p style="color: red;">오류가 발생했습니다: ${error.message}</p>`;
    } finally {
      // 4. Reset state
      analyzeBtn.disabled = false;
      loader.classList.add('hidden');
    }
  });

  function renderSummaries(summaries) {
    resultsContainer.innerHTML = summaries.map(item => {
      // Sanitize summary to prevent basic HTML injection, and format it
      const formattedSummary = item.summary
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');

      return `
        <div class="summary-card">
          <h2><a href="https://www.youtube.com/watch?v=${item.videoId}" target="_blank" rel="noopener noreferrer">${item.videoTitle}</a></h2>
          <h3>${item.channelTitle}</h3>
          <p>${formattedSummary}</p>
        </div>
      `;
    }).join('');
  }
});