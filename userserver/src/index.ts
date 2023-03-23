import express, { NextFunction, Request, response, Response } from "express";
import bodyParser from "body-parser";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
const app = express();
const bcrypt = require("bcrypt");
const cors = require("cors");

// AUTH START
app.listen(4101, () => {
    console.log("server started, listening at port 4101");
});
// adds user to the userDB
import {UserDAO_1} from "./UserDB/db_1";
import {UserDAO_2} from "./UserDB/db_2";
import {UserDAO_3} from "./UserDB/db_3";
app.use(cors());
app.use(cookieParser());
app.use(express.json({ limit: '1gb' }));
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ limit: '1gb',extended: false }));

app.post("/registerUser", async (req, res) => {
    let user = req.body;
    console.log(user);
    // generate userID
    const dateStr: any = Date.now().toString(36); // convert num to base 36 and stringify
    const randomStr: any = Math.random().toString(36).substring(2, 8); // start at index 2 to skip decimal point
    const id = `${dateStr}-${randomStr}`;
    user.id = id;

    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashedpw = await bcrypt.hash(user.password, salt);
    user.password = hashedpw;

    console.log(user);

    try {
        const udb = new UserDAO_1();
        udb.addUser(user, (rows: any) => {
            res.status(200).json(rows);

            // update replica dbs upon successful update to master db
            try {
                const udb_2 = new UserDAO_2();
                udb_2.addUser(user, (rows: any) => {
                    console.log("userdb2 updated");
                });
                udb_2.end();
            } catch (ex) {
                console.log("userdb2 update err: " + ex || "undefined");
            }
            try {
                const udb_3 = new UserDAO_3();
                udb_3.addUser(user, (rows: any) => {
                    console.log("userdb3 updated");
                });
                udb_3.end();
            } catch (ex) {
                console.log("userdb3 update err: " + ex || "undefined");
            }
        });
        udb.end();
    } catch (ex) {
        res
            .status(500)
            .send({ error: "Could not upload file", message: ex || "Unknown" });
        console.log("err: " + ex || "undefined");
    }
});

function generateAccessToken(payload: any) {
    return jwt.sign(payload, "secretKey", { expiresIn: "600s" });
}

// checks if user exists in the userDB
app.post("/login", async (req, res) => {
    let user = req.body;
    try {
        const udb = new UserDAO_1();
        udb.getUser(user.email, async (rows: any) => {
            const result = rows[0];
            // check if user exists
            if (!result) return res.status(404).json("user not found");
            console.log("user exists");

            //check if password is valid
            const validpw = await bcrypt.compare(user.password, result.password);
            if (!validpw) return res.status(400).json("invalid pw");
            console.log("valid pw");

            const payload = { id: result.id };
            const accessToken = generateAccessToken(payload);
            const refreshToken = jwt.sign(payload, "refreshSecretKey");

            // const payload = { email: user.email, id: result.id };
            // const accessToken = generateAccessToken(payload);
            // const refreshToken = jwt.sign(payload, "refreshSecretKey");

            // console.log("Refresh Token: " + refreshToken);
            // console.log("UserID: " + result.id);
            // console.log("Email: " + user.email);
            // console.log("Payload: " + payload);

            const udb2 = new UserDAO_1();
            udb2.addRefreshToken(result.id, refreshToken, (rows: any) => {
                res.status(200).json({
                    userID: result.id,
                    accessToken: accessToken,
                    refreshToken: refreshToken,
                });

                // update replica dbs upon successful update to master db
                try {
                    const udb_2 = new UserDAO_2();
                    udb_2.addRefreshToken(result.id, refreshToken, (rows: any) => {
                        console.log("userdb2 updated");
                    });
                    udb_2.end();
                } catch (ex) {
                    console.log("userdb2 update err: " + ex || "undefined");
                }
                try {
                    const udb_3 = new UserDAO_3();
                    udb_3.addRefreshToken(result.id, refreshToken, (rows: any) => {
                        console.log("userdb3 updated");
                    });
                    udb_3.end();
                } catch (ex) {
                    console.log("userdb3 update err: " + ex || "undefined");
                }
            });
            udb2.end();
        });
        udb.end();
    } catch (ex) {
        res
            .status(403)
            .send({ error: "Could not login", message: ex || "Unknown" });
        console.log("err: " + ex || "undefined");
    }
});

app.delete("/logout", (req, res) => {
    // refreshTokens = refreshTokens.filter((token:any) => token !== req.body.token)
    try {
        const udb = new UserDAO_1();
        udb.removeRefreshToken(req.body.id, (rows: any) => {
            res
                .status(200)
                .send({ message: "logout successful, refresh token deleted" });

            // update replica dbs upon successful update to master db
            try {
                const udb_2 = new UserDAO_2();
                udb_2.removeRefreshToken(req.body.id, (rows: any) => {
                    console.log("userdb2 updated");
                });
                udb_2.end();
            } catch (ex) {
                console.log("userdb2 update err: " + ex || "undefined");
            }
            try {
                const udb_3 = new UserDAO_3();
                udb_3.removeRefreshToken(req.body.id, (rows: any) => {
                    console.log("userdb3 updated");
                });
                udb_3.end();
            } catch (ex) {
                console.log("userdb3 update err: " + ex || "undefined");
            }
        });
        udb.end();
    } catch (ex) {
        res
            .status(500)
            .send({ error: "Could not logout", message: ex || "Unknown" });
        console.log("err: " + ex || "undefined");
    }
});

app.post("/token", (req, res) => {
    const refreshToken = req.body.token;
    const userID = req.body.userID;
    if (refreshToken == null)
        return res.status(401).send({ error: "no refresh token provided" });
    try {
        const udb = new UserDAO_1();
        udb.getRefreshToken(userID, (rows: any) => {
            if (rows[0].refreshToken == null)
                return res.status(403).send({ error: "invalid refresh token" });
            jwt.verify(refreshToken, "refreshSecretKey", (err: any, user: any) => {
                if (err)
                    return res.status(403).send({ error: "invalid refresh token" });

                const accessToken = generateAccessToken({ id: userID });
                res.status(200).json({ accessToken: accessToken });
            });
        });
        udb.end();
    } catch (ex) {
        res.status(500).send({
            error: "Could not generate refresh token",
            message: ex || "Unknown",
        });
        console.log("err: " + ex || "undefined");
    }
});