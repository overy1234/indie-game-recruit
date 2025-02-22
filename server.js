const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const app = express();

// 미들웨어 설정
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// MongoDB Atlas 연결
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://your_username:your_password@cluster0.mongodb.net/indie_game_recruit?retryWrites=true&w=majority';

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('MongoDB Atlas 연결 성공');
}).catch((err) => {
    console.error('MongoDB 연결 실패:', err);
});

// 이미지 업로드 설정
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'public/uploads/');
    },
    filename: function(req, file, cb) {
        // 한글 파일명 처리
        const originalname = Buffer.from(file.originalname, 'latin1').toString('utf8');
        const filename = Date.now() + path.extname(originalname);
        cb(null, filename);
    }
});

const upload = multer({ storage: storage });

// 모집글 스키마 정의
const postSchema = new mongoose.Schema({
    projectTitle: { type: String, required: true },
    recruitPosition: { type: String, required: true },
    description: { type: String, required: true },
    requirements: String,
    contactInfo: { type: String, required: true },
    imageUrl: String,
    createdAt: { type: Date, default: Date.now }
});

const Post = mongoose.model('Post', postSchema);

// API 엔드포인트
// 모집글 작성
app.post('/api/posts', upload.single('projectImage'), async (req, res) => {
    try {
        console.log('받은 데이터:', req.body);
        console.log('받은 파일:', req.file);
        
        const postData = {
            projectTitle: req.body.projectTitle,
            recruitPosition: req.body.recruitPosition,
            description: req.body.description,
            requirements: req.body.requirements,
            contactInfo: req.body.contactInfo,
            imageUrl: req.file ? `http://localhost:3000/uploads/${req.file.filename}` : null
        };

        const post = new Post(postData);
        await post.save();
        res.status(201).json(post);
    } catch (err) {
        console.error('게시글 저장 오류:', err);
        res.status(400).json({ message: err.message });
    }
});

// 모집글 목록 조회
app.get('/api/posts', async (req, res) => {
    try {
        const { position, search } = req.query;
        let query = {};
        
        if (position && position !== '전체') {
            query.recruitPosition = position;
        }
        
        if (search) {
            query.$or = [
                { projectTitle: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }
        
        const posts = await Post.find(query).sort({ createdAt: -1 });
        res.json(posts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 데이터베이스 초기화 엔드포인트
app.delete('/api/reset', async (req, res) => {
    try {
        await Post.deleteMany({});
        console.log('모든 게시글이 삭제되었습니다.');
        res.json({ message: '데이터베이스가 초기화되었습니다.' });
    } catch (err) {
        console.error('데이터베이스 초기화 오류:', err);
        res.status(500).json({ message: err.message });
    }
});

// 서버 시작
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`서버가 ${PORT} 포트에서 실행중입니다.`);
}); 