document.addEventListener('DOMContentLoaded', () => {
    const urlInput = document.getElementById('urlInput');
    const extractBtn = document.getElementById('extractBtn');
    const resultSection = document.getElementById('resultSection');
    const thumbnailPreview = document.getElementById('thumbnailPreview');
    const downloadBtn = document.getElementById('downloadBtn');
    const errorMessage = document.getElementById('errorMessage');

    // Extract on Enter key
    urlInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            extractThumbnail();
        }
    });

    extractBtn.addEventListener('click', extractThumbnail);

    function extractThumbnail() {
        const url = urlInput.value.trim();
        
        // Reset UI
        hideError();
        
        if (!url) {
            showError('URL을 입력해주세요.');
            return;
        }

        const videoId = getVideoId(url);

        if (videoId) {
            // Construct max resolution thumbnail URL
            const validThumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
            
            // Image load check to ensure maxres exists (sometimes it doesn't for older videos)
            const img = new Image();
            img.src = validThumbnailUrl;
            
            img.onload = function() {
                // If width is 120, it's the placeholder "video not found" or "no maxres" image from YouTube
                if (this.width === 120) {
                   // Fallback to high quality
                   showResult(`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`);
                } else {
                   showResult(validThumbnailUrl);
                }
            };

            img.onerror = function() {
                showError('썸네일을 불러올 수 없습니다. 비공개 영상이거나 잘못된 ID일 수 있습니다.');
            };

        } else {
            showError('올바르지 않은 유튜브 URL입니다.');
        }
    }

    function getVideoId(url) {
        let videoId = null;
        
        // Regular expressions for different YouTube URL formats
        const patterns = [
            /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)/, // standard
            /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([^?]+)/,             // short
            /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^?]+)/,   // embed
            /(?:https?:\/\/)?(?:www\.)?youtube\.com\/v\/([^?]+)/        // older
        ];

        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match && match[1]) {
                videoId = match[1];
                break;
            }
        }
        
        // Handle cases where other parameters might be attached (e.g., ?t=...)
        if (videoId && videoId.includes('?')) {
            videoId = videoId.split('?')[0];
        }

        return videoId;
    }

    function showResult(imgUrl) {
        thumbnailPreview.src = imgUrl;
        
        // Set up download button (opens in new tab as direct download is hard without backend proxy due to CORS)
        // However, we can use the 'download' attribute if same origin, but here it's cross origin.
        // We will just link to it for now, or fetch and blob it if text is allowed.
        // Fetching might fail due to CORS on client side without proxy.
        // Let's just set the href.
        downloadBtn.href = imgUrl;
        downloadBtn.target = "_blank";
        
        resultSection.classList.remove('hidden');
        
        // Smooth scroll to result
        // resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function showError(msg) {
        errorMessage.textContent = msg;
        errorMessage.classList.add('show');
        resultSection.classList.add('hidden');
    }

    function hideError() {
        errorMessage.classList.remove('show');
    }
});
