const verifyCurrency = (req, res, next) => {
	const { Currency } = req.body;

	if (Currency === "NGN") {
		next();
	} else {
		return res
			.status(400)
			.json(Currency ? `No fee configurations for ${Currency} transactions` : "Currency is unknown");
	}
};
const verifyPayload = (req, res, next) => {
	verifyCurrency(req, res, () => {
		const {
			Amount,
			CurrencyCountry,
			PaymentEntity: { Country, Type, Brand, Issuer },
		} = req.body;
		if (Country && CurrencyCountry && Amount) {
			next();
		} else {
			res.status(400).json("Data is incomplete");
		}
	});
};

module.exports = {
	verifyPayload,
};
