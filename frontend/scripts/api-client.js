(() => {
  const apiBaseUrl = "http://localhost:3000";

  async function request(path, options) {
    const response = await fetch(`${apiBaseUrl}${path}`, options);
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || `Request failed (HTTP ${response.status}).`);
    }
    return result;
  }

  window.TeacherAI = window.TeacherAI || {};
  window.TeacherAI.api = { request };
})();
