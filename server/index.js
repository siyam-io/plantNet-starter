require("dotenv").config();
const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");
dns.setServers(["8.8.8.8", "8.8.4.4"]);
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
const morgan = require("morgan");

const port = process.env.PORT || 9000;
const app = express();
// middleware
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5176",
    "https://ssiyam0123.github.io",
  ],
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

const verifyToken = async (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).send({ message: "unauthorized access" });
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      console.log(err);
      return res.status(401).send({ message: "unauthorized access" });
    }
    req.user = decoded;
    next();
  });
};

const uri = process.env.MONGO_URI;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
async function run() {
  try {
    //db connnection
    const userCollections = client.db("plantNet").collection("userDb");
    const ordersCollections = client.db("plantNet").collection("orderDb");
    const plantsCollections = client.db("plantNet").collection("plantsDb");

    // Verify Admin Middleware
    const verifyAdmin = async (req, res, next) => {
      const email = req.user?.email;
      const user = await userCollections.findOne({ email });
      if (!user || user.role !== "Admin") {
        return res.status(403).send({ message: "forbidden access" });
      }
      next();
    };

    // Verify Seller Middleware
    const verifySeller = async (req, res, next) => {
      const email = req.user?.email;
      const user = await userCollections.findOne({ email });
      if (!user || user.role !== "Seller") {
        return res.status(403).send({ message: "forbidden access" });
      }
      next();
    };

    // Generate jwt token
    app.post("/jwt", async (req, res) => {
      const email = req.body;
      console.log(email);
      const token = jwt.sign(email, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "365d",
      });
      res
        .cookie("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        })
        .send({ success: true });
    });
    // Logout
    app.get("/logout", async (req, res) => {
      try {
        res
          .clearCookie("token", {
            maxAge: 0,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
          })
          .send({ success: true });
      } catch (err) {
        res.status(500).send(err);
      }
    });

    //user route
    app.post("/user/:email", async (req, res) => {
      const email = req.params;
      console.log(email);
      const user = req.body;
      const query = await userCollections.findOne(email);
      if (!query) {
        const userData = {
          ...user,
          role: "Customer",
        };
        console.log("after affended user role:", userData);
        const result = await userCollections.insertOne(userData);
        res.send(result);
      } else {
        res.send(query);
      }
    });

    //post plant to database
    app.post("/add-plant", verifyToken, verifySeller, async (req, res) => {
      const data = req.body;
      console.log(data);
      const result = await plantsCollections.insertOne(data);
      res.send(result);
    });

    //get plant route (allows filtering by seller.email if query param is passed)
    app.get("/plants", async (req, res) => {
      const email = req.query.email;
      let query = {};
      if (email) {
        query = { "seller.email": email };
      }
      const result = await plantsCollections.find(query).toArray();
      res.send(result);
    });

    //for single plant api
    app.get("/details/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await plantsCollections.findOne(query);
      res.send(result);
    });

    //inventory delete api
    app.delete("/delete/:id", verifyToken, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const plant = await plantsCollections.findOne(query);
      if (!plant) {
        return res.status(404).send({ message: "Plant not found" });
      }
      
      const email = req.user?.email;
      const user = await userCollections.findOne({ email });
      if (plant.seller?.email !== email && user?.role !== "Admin") {
        return res.status(403).send({ message: "forbidden access" });
      }

      const result = await plantsCollections.deleteOne(query);
      res.send(result);
    });

    //get all users (Admin only)
    app.get("/users", verifyToken, verifyAdmin, async (req, res) => {
      const result = await userCollections.find().toArray();
      res.send(result);
    });

    //api for user info
    app.get("/user/:email", verifyToken, async (req, res) => {
      const email = req.params.email;
      if (req.user?.email !== email) {
        const requester = await userCollections.findOne({ email: req.user?.email });
        if (requester?.role !== "Admin") {
          return res.status(403).send({ message: "forbidden access" });
        }
      }
      const query = { email: email };
      const result = await userCollections.find(query).toArray();
      res.send(result);
    });

    //save order data
    app.post("/orderPurchase", verifyToken, async (req, res) => {
      const data = req.body;
      const result = await ordersCollections.insertOne(data);
      res.send(result);
    });

    //manage plant quantity
    app.patch("/plants/quantity/:id", verifyToken, async (req, res) => {
      const id = req.params.id;
      const { quantityToUpdate, status } = req.body;
      const query = { _id: new ObjectId(id) };
      let update = {
        $inc: { quantity: -quantityToUpdate },
      };
      if (status === "increase") {
        update = {
          $inc: {
            quantity: quantityToUpdate,
          },
        };
      }
      const result = await plantsCollections.findOneAndUpdate(query, update);
      res.send(result);
    });

    //get my order
    app.get("/myorders/:email", verifyToken, async (req, res) => {
      const email = req.params.email;
      if (req.user?.email !== email) {
        return res.status(403).send({ message: "forbidden access" });
      }
      const query = { "customer.email": email };
      const result = await ordersCollections
        .aggregate([
          {
            $match: query,
          },
          {
            $addFields: {
              plantId: {
                $toObjectId: "$plantId",
              },
            },
          },
          {
            $lookup: {
              from: "plantsDb",
              localField: "plantId",
              foreignField: "_id",
              as: "plants",
            },
          },
          {
            $unwind: "$plants",
          },
          {
            $addFields: {
              name: "$plants.name",
              image: "$plants.image",
              category: "$plants.category",
            },
          },
          {
            $project: {
              plants: 0,
            },
          },
        ])
        .toArray();
      res.send(result);
    });

    //get seller orders
    app.get("/seller-orders/:email", verifyToken, verifySeller, async (req, res) => {
      const email = req.params.email;
      if (req.user?.email !== email) {
        return res.status(403).send({ message: "forbidden access" });
      }
      const result = await ordersCollections
        .aggregate([
          {
            $match: { seller: email },
          },
          {
            $addFields: {
              plantId: {
                $toObjectId: "$plantId",
              },
            },
          },
          {
            $lookup: {
              from: "plantsDb",
              localField: "plantId",
              foreignField: "_id",
              as: "plants",
            },
          },
          {
            $unwind: "$plants",
          },
          {
            $addFields: {
              name: "$plants.name",
              image: "$plants.image",
              category: "$plants.category",
            },
          },
          {
            $project: {
              plants: 0,
            },
          },
        ])
        .toArray();
      res.send(result);
    });

    //cancel order api
    app.delete("/cancelorder/:id", verifyToken, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      
      const order = await ordersCollections.findOne(query);
      if (!order) return res.status(404).send({ message: "Order not found" });

      const email = req.user?.email;
      const user = await userCollections.findOne({ email });
      if (order.customer?.email !== email && order.seller !== email && user?.role !== "Admin") {
        return res.status(403).send({ message: "forbidden access" });
      }

      const result = await ordersCollections.deleteOne(query);
      res.send(result);
    });

    //update order status (Seller only)
    app.patch("/orders/status/:id", verifyToken, verifySeller, async (req, res) => {
      const id = req.params.id;
      const { status } = req.body;
      const query = { _id: new ObjectId(id) };

      const order = await ordersCollections.findOne(query);
      if (!order) return res.status(404).send({ message: "Order not found" });
      if (order.seller !== req.user?.email) {
        return res.status(403).send({ message: "forbidden access" });
      }

      const updateDoc = {
        $set: { status },
      };
      const result = await ordersCollections.updateOne(query, updateDoc);
      res.send(result);
    });

    //update inventory
    app.put("/update/:id", verifyToken, verifySeller, async (req, res) => {
      const id = req.params.id;
      const data = req.body;
      const query = { _id: new ObjectId(id) };
      
      const plant = await plantsCollections.findOne(query);
      if (!plant) return res.status(404).send({ message: "Plant not found" });
      if (plant.seller?.email !== req.user?.email) {
        return res.status(403).send({ message: "forbidden access" });
      }

      const updateDoc = {
        $set: {
          name: data.name,
          category: data.category,
          description: data.description,
          image: data.image,
          price: data.price,
          quantity: data.quantity,
        },
      };
      const result = await plantsCollections.updateOne(query, updateDoc);
      res.send(result);
    });

    //manage user status and role (Admin or user requesting status change)
    app.patch("/user/:email", verifyToken, async (req, res) => {
      const email = req.params.email;
      const { role, status } = req.body;
      const query = { email };

      const requesterEmail = req.user?.email;
      const requester = await userCollections.findOne({ email: requesterEmail });

      if (requester?.role === "Admin") {
        const updateDoc = {
          $set: {
            ...(role && { role }),
            ...(status && { status }),
          },
        };
        const result = await userCollections.updateOne(query, updateDoc);
        return res.send(result);
      } else {
        const user = await userCollections.findOne(query);
        if (!user) return res.status(404).send("User not found");
        if (user.status === "Requested") {
          return res.status(400).send("You have already requested to become a seller.");
        }
        const updateDoc = {
          $set: {
            status: "Requested",
          },
        };
        const result = await userCollections.updateOne(query, updateDoc);
        return res.send(result);
      }
    });

    //get user role
    app.get("/user/role/:email", verifyToken, async (req, res) => {
      const email = req.params.email;
      if (req.user?.email !== email) {
        const requester = await userCollections.findOne({ email: req.user?.email });
        if (requester?.role !== "Admin") {
          return res.status(403).send({ role: null });
        }
      }
      const result = await userCollections.findOne({ email });
      res.send({ role: result?.role });
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello from plantNet Server..");
});

app.listen(port, () => {
  console.log(`plantNet is running on port ${port}`);
});
