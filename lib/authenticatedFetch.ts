const getCookie = (name: string): string => {
    const nameLenPlus = name.length + 1;
    return (
        document.cookie
            .split(';')
            .map(c => c.trim())
            .filter(cookie => cookie.substring(0, nameLenPlus) === `${name}=`)
            .map(cookie => decodeURIComponent(cookie.substring(nameLenPlus)))[0] || ''
    );
};
/**
* Utility to handle authenticated requests with automatic token refreshing.
*/
export async function authenticatedFetch(url: string, options: RequestInit = {}) {
    const csrf_access_token = getCookie('csrf_access_token');

    // Set default headers
    options.headers = {
        ...options.headers,
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': csrf_access_token || '',
    };
    options.credentials = 'include';

    let response = await fetch(url, options);

    // If unauthorized (expired access token), attempt to refresh
    if (response.status === 401) {
        const refreshResponse = await fetch('http://localhost:5000/token/refresh', {
            method: 'POST',
            headers: { 'X-CSRF-TOKEN': getCookie('csrf_refresh_token') || '' },
            credentials: 'include',
        });

        if (refreshResponse.ok) {
            // Refresh successful, update CSRF token and retry original request
            const newCsrfToken = getCookie('csrf_access_token');
            (options.headers as any)['X-CSRF-TOKEN'] = newCsrfToken;

            return fetch(url, options);
        } else {
            // Refresh failed (refresh token expired), redirect to login
            window.location.href = '/login';
        }
    }

    return response;
}