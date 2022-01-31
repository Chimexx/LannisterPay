const router = require("express").Router();
("use strict");
const fs = require("fs");

//Transactions
router.post("/", async (req, res) => {
	//fetch and parse config file
	let data = fs.readFileSync("FeeConfigurationSpec.json");
	let configs = await JSON.parse(data);

	const { Issuer, Brand, Type, Country } = req.body.PaymentEntity;
	const { Currency } = req.body;

	//set the locale of the request data
	const locale = req.body.CurrencyCountry === Country ? "LOCL" : "INTL";
	console.log(locale);

	const { Amount } = req.body;
	const { BearsFee } = req.body.Customer;

	const calc = (id) => {
		const config = configs.filter((config) => config.id === id)[0];
		let AppliedFeeValue;
		if (!BearsFee) {
			AppliedFeeValue = 0;
		} else {
			if (config.feeType === "FLAT_PERC") {
				AppliedFeeValue = config.feeValue.flat + (config.feeValue.perc / 100) * Amount;
			} else if (config.feeType === "FLAT") {
				AppliedFeeValue = config.feeValue.flat;
			} else {
				AppliedFeeValue = (config.feeValue.perc / 100) * Amount;
			}
		}
		return {
			AppliedFeeID: id,
			AppliedFeeValue: parseFloat(AppliedFeeValue.toFixed(1)),
			ChargeAmount: Amount + AppliedFeeValue,
			SettlementAmount: Amount,
		};
	};
	try {
		//Check for supported currency
		if (Currency === "NGN") {
			//if credit-card transaction
			if (Type === "CREDIT-CARD" || Type === "DEBIT-CARD") {
				if (Brand) {
					if (locale === "LOCL") {
						return res.status(200).json(calc("LNPY1223"));
					} else if (locale === "INTL") {
						return res.status(200).json(calc("LNPY1222"));
					}
				} else {
					if (locale === "LOCL" || locale === "INTL") {
						return res.status(200).json(calc("LNPY1223"));
					} else {
						return res.status(200).json(calc("LNPY1221"));
					}
				}

				//if ussd transaction
			} else if (Type === "USSD") {
				const prop = configs.filter((config) => config.feeEntity === "USSD")[0];
				if (Issuer && Issuer === prop.entityProperty) {
					return res.status(200).json(calc("LNPY1225"));
				} else {
					return res.status(200).json(calc("LNPY1221"));
				}
				//if wallet transaction
			} else if (Type === "WALLET-ID") {
				return res.status(200).json(calc("LNPY1221"));

				//if bank transaction
			} else if (Type === "BANK-ACCOUNT") {
				if (Issuer) {
					return res.status(200).json(calc("LNPY1224"));
				} else {
					return res.status(200).json(calc("LNPY1221"));
				}
			} else {
				return res.status(200).json(calc("LNPY1221"));
			}

			//if unsupported or no currency
		} else {
			return res
				.status(400)
				.json(
					Currency ? `No fee configurations for ${Currency} transactions` : "Currency is unknown"
				);
		}
		// res.status(200).json("ok");
	} catch (error) {
		res.status(500).json(error);
		console.log(error);
	}
});

module.exports = router;
