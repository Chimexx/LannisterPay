const express = require("express");
const app = express();

const feeRoute = require("./routes/fees");
const transactionRoute = require("./routes/transactions");

dotenv.config();
app.use(express.json());
app.use(cors());

app.use("/fees", feeRoute);
app.use("/compute-transaction-fee", transactionRoute);

app.listen(process.env.PORT || 5000, () => {
	console.log("Server Running");
});
