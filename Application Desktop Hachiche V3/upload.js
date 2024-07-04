// upload.js
document.getElementById('uploadForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData();
    const fileInput = document.getElementById('fileInput');
    formData.append('file', fileInput.files[0]);

    try {
        const response = await axios.post('http://localhost:3000/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        document.getElementById('uploadResult').innerText = response.data;
    } catch (error) {
        console.error(error);
        document.getElementById('uploadResult').innerText = 'Erreur lors de l\'upload.';
    }
});
