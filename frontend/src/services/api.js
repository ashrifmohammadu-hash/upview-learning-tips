export const API_URL = 'http://localhost:8000/api';

export const login = async (email, password) => {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
    });
    
    if (!response.ok) {
        throw new Error('Invalid email or password');
    }
    return response.json();
};

export const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
    };
};

export const submitTip = async (body) => {
    const response = await fetch(`${API_URL}/tips`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ body }),
    });
    
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.detail || 'Failed to submit tip');
    }
    return data;
};

export const getOwnTips = async () => {
    const response = await fetch(`${API_URL}/tips`, {
        headers: getAuthHeaders(),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || 'Failed to fetch tips');
    return data;
};

export const getPendingTips = async () => {
    const response = await fetch(`${API_URL}/reviewer/tips/pending`, {
        headers: getAuthHeaders(),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || 'Failed to fetch pending tips');
    return data;
};

export const approveTip = async (id) => {
    const response = await fetch(`${API_URL}/reviewer/tips/${id}/approve`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || 'Failed to approve');
    return data;
};

export const rejectTip = async (id, reason) => {
    const response = await fetch(`${API_URL}/reviewer/tips/${id}/reject`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ reason }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || 'Failed to reject');
    return data;
};
