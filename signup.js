const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');  
const zod = require("zod")
const app = express();
app.use(express.json());

const jwtpass = "aslfhedcweohohce";
mongoose.connect("mongodb+srv://User:praneeth@cluster0.srzjk.mongodb.net/UserData");

const usernameSchema = zod.string().regex(/^[A-Za-z0-9_]+$/, {
    message: 'Username can only contain alphanumeric characters and underscores.'
  });
  const passwordSchema = zod.string().regex(/^(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).*$/, {
    message: 'Password must contain at least one number and one special character.',
  });

  const emailSchema = zod.string().email({
    message: 'Incorrect email format'
  });
const User = mongoose.model('users', {
    firstname: String,
    lastname: String,
    email: String,
    username : String,
    password: String
});
async function userexists(username) {
    const user = await User.findOne({ username: username });  
    return user;  
}

app.post("/signup", async function(req, res) {
    const fn = req.body.firstname;
    const ln = req.body.lastname;
    const email = req.body.email;
    const username = req.body.username;
    const password = req.body.password;

    const usernameValidation=usernameSchema.safeParse(username);
    if (!usernameValidation.success) {
        return res.status(400).json({ error: usernameValidation.error.errors[0].message });
      }

      const emailValidation = emailSchema.safeParse(email);
      if(!emailValidation.success){
          return res.status(400).json({ error: emailValidation.error.errors[0].message})
      }


    const exist = await User.findOne({ username: username });
    if (exist) {
        return res.status(409).send("Username already exists");
    }
    const mailexist = await User.findOne({ email: email });

    if (mailexist) {
        return res.status(409).send("Email already exists");
    }
    
    const passwordValidation = passwordSchema.safeParse(password);
    if (!passwordValidation.success) {
      return res.status(400).json({ error: passwordValidation.error.errors[0].message });
    }
    
      

      
    const hashedPassword = await bcrypt.hash(password, 10); 

    const user = new User({
        firstname: fn,
        lastname: ln,
        email: email,
        username : username,
        password: hashedPassword  
    });

    await user.save();
    res.json({
        msg: "User created successfully"
    });
});

app.post("/signin", async function(req, res) {
    const username = req.body.username;
    const password = req.body.password;

    const user = await userexists(username);  // Check if user exists

    if (!user) {
        return res.status(401).send("Invalid username or password");
    }

    
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        return res.status(401).send("Invalid username or password");
    }

    
    const token = jwt.sign({ userId: user._id }, jwtpass, { expiresIn: "1h" });

    res.json({
        msg: "Signin successful",
        token: token
    });
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});
