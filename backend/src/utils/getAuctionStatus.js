const getAuctionStatus = (auction) => {
  const now = new Date();

  if (now < new Date(auction.bidStartTime)) return "UPCOMING";

  if (
    now >= new Date(auction.bidStartTime) &&
    now <= new Date(auction.bidCloseTime)
  ) return "ACTIVE";

  if (
    now > new Date(auction.bidCloseTime) &&
    now <= new Date(auction.forcedCloseTime)
  ) return "CLOSED";

  return "FORCE_CLOSED";
};

module.exports = getAuctionStatus;