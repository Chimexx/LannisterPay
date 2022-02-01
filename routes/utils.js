("use strict");
const fs = require("fs");

//fetch and parse config file
const calc = async (id, req) => {
	let data = fs.readFileSync("FeeConfigurationSpec.json");
	let configs = await JSON.parse(data);

	const {
		Amount,
		Customer: { BearsFee },
	} = req.body;

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

module.exports = {
	calc,
};
