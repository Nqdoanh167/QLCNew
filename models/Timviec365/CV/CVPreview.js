// Không dùng
import mongoose from 'mongoose';
const CVPreviewSchema = new mongoose.Schema({
    _id: {
        type: Number
    },
    lang: {
        type: String
    },
    html: {
        type: String
    },
    nameImage: {
        type: String
    },
    timeUpdate: {
        type: Date
    }
}, {
    collection: 'CVPreview',
    versionKey: false
});

export default mongoose.model("CVPreview", CVPreviewSchema)