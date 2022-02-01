const router = require("express").Router();
("use strict");
const fs = require("fs");
const { verifyPayload } = require("./validation");
const { calc } = require("./utils");

//Transactions
router.post("/", verifyPayload, async (req, res) => {
	//fetch and parse config file
	let data = fs.readFileSync("FeeConfigurationSpec.json");
	let configs = await JSON.parse(data);

	const ids = [];
	configs.forEach((config, index) => ids.push({ index: config.id }));

	console.log("ids:", ids);
	const {
		PaymentEntity: { Issuer, Brand, Type, Country },
	} = req.body;

	//set the locale of the request data
	const locale = req.body.CurrencyCountry === Country ? "LOCL" : "INTL";

	try {
		//if credit-card transaction
		if (Type === "CREDIT-CARD" || Type === "DEBIT-CARD") {
			if (Brand) {
				if (locale === "LOCL") {
					return res.status(200).json(await calc("LNPY1223", req));
				} else if (locale === "INTL") {
					return res.status(200).json(await calc("LNPY1222", req));
				}
			} else {
				if (locale === "LOCL" || locale === "INTL") {
					return res.status(200).json(await calc("LNPY1223", req));
				} else {
					return res.status(200).json(await calc("LNPY1221", req));
				}
			}

			//if ussd transaction
		} else if (Type === "USSD") {
			const prop = configs.filter((config) => config.feeEntity === "USSD")[0];
			if (Issuer && Issuer === prop.entityProperty) {
				return res.status(200).json(await calc("LNPY1225", req));
			} else {
				return res.status(200).json(await calc("LNPY1221", req));
			}

			//if wallet transaction
		} else if (Type === "WALLET-ID") {
			return res.status(200).json(await calc("LNPY1221", req));

			//if bank transaction
		} else if (Type === "BANK-ACCOUNT") {
			if (Issuer) {
				return res.status(200).json(await calc("LNPY1224", req));
			} else {
				return res.status(200).json(await calc("LNPY1221", req));
			}
		} else {
			return res.status(200).json(await calc("LNPY1221", req));
		}
	} catch (error) {
		res.status(500).json(error);
		console.log(error);
	}
});

module.exports = router;
