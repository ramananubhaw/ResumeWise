import mongoose from 'mongoose';
const { Schema } = mongoose;

const UserSchema = new Schema({
    // --- Authentication Fields ---
    email: {
        type: String,
        required: true,
        unique: true, // Crucial for unique user identification
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: function() { return !this.googleId && !this.githubId; } // Required ONLY for local login
    },

    // --- Profile Information ---
    name: {
        type: String,
        trim: true,
        required: true
    },
    
    // --- Timestamps ---
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Important: Before saving the user, use pre-save hook to hash the password here (e.g., using bcrypt)

export const User = mongoose.model('users', UserSchema);