document.addEventListener('DOMContentLoaded', function() {
    const contentDiv = document.getElementById('content');

    const token = localStorage.getItem('api_token');
    
    if (!token) {
        document.getElementById('getUserBtn').style.display = 'none';
        document.getElementById('createPostBtn').style.display = 'none';
        document.getElementById('viewPostsBtn').style.display = 'none';
        document.getElementById('logoutBtn').style.display = 'none';
    } else {
        document.getElementById('getUserBtn').style.display = 'inline-block';
        document.getElementById('createPostBtn').style.display = 'inline-block';
        document.getElementById('viewPostsBtn').style.display = 'inline-block';
        document.getElementById('logoutBtn').style.display = 'inline-block';

        document.getElementById('registerBtn').style.display = 'none';
        document.getElementById('loginBtn').style.display = 'none';
    }

    document.getElementById('registerBtn').addEventListener('click', function() {
        contentDiv.innerHTML = `
            <div class="container">
                <h2>Register</h2>
                <form id="register-form">
                    <label for="name">Name</label>
                    <input type="text" name="name" id="name" required>

                    <label for="email">Email</label>
                    <input type="email" name="email" id="email" required>

                    <label for="password">Password</label>
                    <input type="password" name="password" id="password" required>

                    <label for="password_confirmation">Confirm Password</label>
                    <input type="password" name="password_confirmation" id="password_confirmation" required>

                    <input type="submit" value="Register">
                </form>
                <div id="register-response"></div>
            </div>
        `;
        attachRegisterEvent();
    });


    document.getElementById('loginBtn').addEventListener('click', loginFormShow);

    function loginFormShow() {
        contentDiv.innerHTML = `
            <div class="container">
                <h2>Login</h2>
                <form id="login-form">
                    <label for="email">Email</label>
                    <input type="email" name="email" id="login-email" required>

                    <label for="password">Password</label>
                    <input type="password" name="password" id="login-password" required>

                    <input type="submit" value="Login">
                </form>
                <div id="login-response"></div>
            </div>
        `;
        attachLoginEvent();
    }

    document.getElementById('logoutBtn').addEventListener('click', function() {
        logout();
    });

    document.getElementById('getUserBtn').addEventListener('click', function() {
        const token = localStorage.getItem('api_token');
        contentDiv.innerHTML = `
            <div class="container">
                <h2>Get User</h2>
                <form id="get-user-form">
                    <label for="get-token">Token</label>
                    <input type="text" name="token" id="get-token" value="${token || ''}" readonly>
                    <input type="submit" value="Get">
                </form>
                <div id="user-data"></div>
            </div>
        `;
        attachGetUserEvent();
    });

    document.getElementById('createPostBtn').addEventListener('click', function() {
        const token = localStorage.getItem('api_token');
        contentDiv.innerHTML = `
            <div class="container">
                <h2>Create Post</h2>
                <form id="create-post-form">
                    <label for="create-token">Token</label>
                    <input type="text" name="token" id="create-token" value="${token || ''}" readonly>

                    <label for="title">Title</label>
                    <input type="text" name="title" id="title" required>

                    <label for="body">Body</label>
                    <textarea name="body" id="body" required></textarea>

                    <input type="submit" value="Create">
                </form>
                <div id="post-data"></div>
            </div>
        `;
    });

    document.getElementById('viewPostsBtn').addEventListener('click', function() {
        const token = localStorage.getItem('api_token');
        contentDiv.innerHTML = `
            <div class="container">
                <h2>Posts</h2>
                <div id="user-posts"></div>
            </div>
        `;
        if (token) {
            fetchAllPosts(token);
        } else {
            document.getElementById('user-posts').innerHTML = '<p>Please provide a valid token first.</p>';
        }
    });

    loginFormShow();
});

function attachRegisterEvent() {
    const form = document.getElementById('register-form');
    form.addEventListener('submit', async function(event) {
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const password_confirmation = document.getElementById('password_confirmation').value;

        try {
            const response = await fetch('http://127.0.0.1:8000/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name, email, password, password_confirmation
                })
            });

            const data = await response.json();
            if (response.ok) {
                document.getElementById('register-response').innerText = 'Registration successful!';
            } else {
                document.getElementById('register-response').innerText = `Error: ${data.message}`;
            }
        } catch (error) {
            console.error('Error:', error);
        }
    });
}

function attachLoginEvent() {
    const form = document.getElementById('login-form');
    form.addEventListener('submit', async function(event) {
        event.preventDefault();

        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        try {
            const response = await fetch('http://127.0.0.1:8000/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email, password
                })
            });

            const data = await response.json();
            if (response.ok) {
                localStorage.setItem('api_token', data.token);
                document.getElementById('login-response').innerText = `Login successful! Token saved.`;

                document.getElementById('getUserBtn').style.display = 'inline-block';
                document.getElementById('createPostBtn').style.display = 'inline-block';
                document.getElementById('viewPostsBtn').style.display = 'inline-block';
                document.getElementById('logoutBtn').style.display = 'inline-block';

                document.getElementById('registerBtn').style.display = 'none';
                document.getElementById('loginBtn').style.display = 'none';
            } else {
                document.getElementById('login-response').innerText = `Error: ${data.message}`;
            }
        } catch (error) {
            console.error('Error:', error);
        }
    });
}

function attachCreatePostEvent() {
    const postForm = document.getElementById('create-post-form');
    postForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        let token = localStorage.getItem('api_token') || document.getElementById('create-token').value;

        try {
            const response = await fetch('http://127.0.0.1:8000/api/posts', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title: document.getElementById('title').value,
                    body: document.getElementById('body').value
                })
            });

            const data = await response.json();

            if (response.ok) {
                document.getElementById('post-data').innerHTML = `<p>Post Created Successfully!</p>`;
                fetchAllPosts(token);
            } else {
                document.getElementById('post-data').innerHTML = `<p>Failed to create post. ${data.message}</p>`;
            }
        } catch (error) {
            console.error('Error creating post:', error);
        }
    });
}

async function fetchAllPosts(token) {
    try {
        const response = await fetch('http://127.0.0.1:8000/api/posts', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const posts = await response.json();

        if (response.ok) {
            const postsContainer = document.getElementById('user-posts');
            postsContainer.innerHTML = '';
            posts.forEach(post => {
                postsContainer.innerHTML += `
                    <div class="post">
                        <p><strong>Title:</strong> ${post.title}</p>
                        <p><strong>Body:</strong> ${post.body}</p>
                        <button class="delete-post-btn" data-id="${post.id}">Delete</button>
                    </div>
                `;
            });

            document.querySelectorAll('.delete-post-btn').forEach(button => {
                button.addEventListener('click', async function() {
                    const postId = this.getAttribute('data-id');
                    await deletePost(postId, token);
                    fetchAllPosts(token);
                });
            });
        } else {
            document.getElementById('user-posts').innerHTML = `<p>Failed to fetch posts. ${posts.message}</p>`;
        }
    } catch (error) {
        console.error('Error fetching posts:', error);
    }
}

async function deletePost(postId, token) {
    try {
        const response = await fetch(`http://127.0.0.1:8000/api/posts/${postId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            alert('Post deleted successfully!');
        } else {
            alert('Failed to delete post.');
        }
    } catch (error) {
        console.error('Error deleting post:', error);
    }
}

function logout() {
    document.getElementById('getUserBtn').style.display = 'none';
    document.getElementById('createPostBtn').style.display = 'none';
    document.getElementById('viewPostsBtn').style.display = 'none';
    document.getElementById('logoutBtn').style.display = 'none';

    document.getElementById('registerBtn').style.display = 'inline-block';
    document.getElementById('loginBtn').style.display = 'inline-block';

    document.getElementById('login-response').innerText = 'You have logged out.';
}
