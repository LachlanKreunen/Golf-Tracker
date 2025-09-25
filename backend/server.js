import express from "express";
import cors from "cors";
import { MongoClient, ObjectId } from "mongodb";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import "dotenv/config";

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/golftracker";
const PORT = process.env.PORT || 8080;
const JWT_SECRET = process.env.JWT_SECRET;

const client = new MongoClient(MONGODB_URI, { ignoreUndefined: true });
function db() { return client.db(); }
const Users = () => db().collection("users");
const Rounds = () => db().collection("rounds");

async function ensureMongo() {
  if (!client.topology || !client.topology.isConnected()) {
    await client.connect();
    await Users().createIndex({ username: 1 }, { unique: true });
    console.log("Mongo connected");
  }
}

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}
function requireAuth(req, res, next) {
  const hdr = req.headers.authorization || "";
  const [, token] = hdr.split(" ");
  if (!token) return res.status(401).json({ error: "Missing token" });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    return next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

app.get("/health", (_req, res) => res.json({ ok: true }));

app.post("/register", async (req, res) => {
  try {
    await ensureMongo();
    const { first = "", last = "", username, password } = req.body || {};
    if (!username || !password) return res.status(400).json({ error: "username and password are required" });
    if (password.length < 6) return res.status(400).json({ error: "password must be at least 6 characters" });

    const exists = await Users().findOne({ username });
    if (exists) return res.status(409).json({ error: "username already taken" });

    const passwordHash = await bcrypt.hash(password, 12);
    const doc = { username, first, last, passwordHash, createdAt: new Date() };
    const { insertedId } = await Users().insertOne(doc);

    const token = signToken({ sub: insertedId.toString(), username });
    res.status(201).json({
      token,
      user: { id: insertedId, username, first, last },
      message: "account created",
    });
  } catch (err) {
    console.error("register error:", err);
    res.status(500).json({ error: "register failed" });
  }
});

app.post("/login", async (req, res) => {
  try {
    await ensureMongo();
    const { username, password } = req.body || {};
    if (!username || !password) return res.status(400).json({ error: "username and password are required" });

    const user = await Users().findOne({ username });
    if (!user) return res.status(401).json({ error: "invalid credentials" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "invalid credentials" });

    const token = signToken({ sub: user._id.toString(), username: user.username });
    res.json({
      token,
      user: { id: user._id, username: user.username, first: user.first ?? "", last: user.last ?? "" },
      message: "login ok",
    });
  } catch (err) {
    console.error("login error:", err);
    res.status(500).json({ error: "login failed" });
  }
});

app.get("/me", requireAuth, async (req, res) => {
  try {
    await ensureMongo();
    const me = await Users().findOne(
      { _id: new ObjectId(req.user.sub) },
      { projection: { passwordHash: 0 } }
    );
    if (!me) return res.status(404).json({ error: "user not found" });
    res.json({
      id: me._id,
      username: me.username,
      first: me.first ?? "",
      last: me.last ?? "",
      createdAt: me.createdAt,
    });
  } catch (err) {
    console.error("me error:", err);
    res.status(500).json({ error: "failed to fetch profile" });
  }
});

app.get("/rounds", requireAuth, async (req, res) => {
  try {
    await ensureMongo();
    const rounds = await Rounds()
      .find({ userId: new ObjectId(req.user.sub) })
      .project({ courseName: 1, holes: 1, startedAt: 1, createdAt: 1, completedAt: 1 })
      .sort({ startedAt: -1, createdAt: -1 })
      .toArray();
    res.json({ rounds });
  } catch (e) {
    console.error("GET /rounds error:", e);
    res.status(500).json({ error: "List rounds failed" });
  }
});

// create a round for logged user
app.post("/rounds", requireAuth, async (req, res) => {
  try {
    await ensureMongo();
    const b = req.body || {};
    const roundDoc = {
      userId: new ObjectId(req.user.sub),
      courseId: b.courseId || null,
      courseName: b.courseName || "Unknown Course",
      teeName: b.teeName || null,
      holes: Array.isArray(b.holes)
        ? b.holes.map(h => ({
            holeNumber: h.holeNumber,
            par: h.par ?? null,
            yards: h.yards ?? null,
            score: h.score ?? null,
            putts: h.putts ?? null,
            fairwayHit: typeof h.fairwayHit === "boolean" ? h.fairwayHit : null,
            greenInReg: typeof h.greenInReg === "boolean" ? h.greenInReg : null,
          }))
        : [],
      startedAt: b.startedAt ? new Date(b.startedAt) : new Date(),
      completedAt: b.completedAt ? new Date(b.completedAt) : null,
      createdAt: new Date(),
    };
    const { insertedId } = await Rounds().insertOne(roundDoc);
    res.status(201).json({ roundId: insertedId });
  } catch (e) {
    console.error("create round error:", e);
    res.status(500).json({ error: "Create round failed" });
  }
});
app.delete("/rounds/:id", requireAuth, async (req, res) => {
  try {
    await ensureMongo();

    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid round id" });
    }

    const filter = { _id: new ObjectId(id), userId: new ObjectId(req.user.sub) };
    const result = await Rounds().deleteOne(filter);

    if (result.deletedCount === 0) {

      return res.status(404).json({ error: "Round not found" });
    }
    return res.status(204).end();
  } catch (err) {
    console.error("DELETE /rounds/:id error:", err);
    return res.status(500).json({ error: "Failed to delete round" });
  }
});


app.listen(PORT, () => {
  console.log(`running at http://127.0.0.1:${PORT}`);
});