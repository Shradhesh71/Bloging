const {Schema, model} = require("mongoose");
const {createHmac, randomBytes} = require("crypto");
const { createTokenForUser } = require("../services/authentication");


const userSchema = new Schema(
  {
    fullName: { 
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    salt:{
        type: String,
        // required: true,
    },
    password: {
      type: String,
      required: true,
    },
    profileImageURL:{
        type: String,
        default:"/images/default.png",
    },
    role:{
        type: String,
        enum: ["USER","ADMIN"],
        default:"USER"
    },
  },
  { timestamps: true }
);

userSchema.pre("save", function(next){
    const user = this;

    if(!user.isModified("password")) return;
    const salt = randomBytes(16).toString();
    const hashpassword = createHmac("sha256", salt)
        .update(user.password)
        .digest("hex"); 

    this.salt = salt;
    this.password = hashpassword;
    next();
})

userSchema.static("matchPasswordAndGenerateToken",async function(email, password) {
    const user = await this.findOne({email});
    if(!user) throw new Error("Couldn't find User");

    const salt = user.salt;
    const hashpassword = user.password;

    const providePassword = createHmac("sha256", salt)
        .update(password)
        .digest("hex");

    if(hashpassword !== providePassword)
        throw new Error("Passwords do not match");
    
    const token = createTokenForUser(user);
    return token;
    // {...user._doc, password: undefined, salt: undefined}
})

const User = model("user", userSchema);

module.exports = User;