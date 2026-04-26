import { useState, useEffect, useCallback } from "react";
import { getAuctionStatus } from "../utils/helpers";
import socket from "../utils/socket";

const API = import.meta.env.VITE_API_URL;


function mapTrigger(type) {
  if (type === "ANY_BID") return "bid_received";
  if (type === "RANK_CHANGE") return "rank_change";
  return "l1_change";
}

function mapBackTrigger(type) {
  if (type === "bid_received") return "ANY_BID";
  if (type === "rank_change") return "RANK_CHANGE";
  return "L1_CHANGE";
}

export function useAuction() {
  const [allData, setAllData] = useState([]);
  const [bidsMap, setBidsMap] = useState({});
  const [logsMap, setLogsMap] = useState({});
  const [toasts, setToasts] = useState([]);

  // 🔥 FETCH AUCTIONS
 const fetchAuctions = useCallback(async () => {
  try {

    const token = localStorage.getItem("token");
    if (!token) return;


    const res = await fetch(`${API}/auctions`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (!res.ok) {
      console.log("Fetch failed:", res.status);
      return;
    }
    const data = await res.json();

    const formatted = data.map((a) => ({
      __backendId: a._id,
      type: "rfq",
      rfq_name: a.name,
      rfq_id: a._id,
      bid_start: a.bidStartTime,
      bid_close: a.bidCloseTime,
      forced_close: a.forcedCloseTime,
      current_close: a.bidCloseTime,
      trigger_window: a.triggerWindow,
      extension_duration: a.extensionDuration,
      extension_trigger: mapTrigger(a.triggerType),
      _backendStatus: a.status,
    }));

    setAllData(formatted);
  } catch (err) {
    console.log(err);
  }
}, []);

  // 🔥 FETCH DETAILS (BIDS + LOGS)
  const fetchDetails = useCallback(async (rfqId) => {
  try {
    const res = await fetch(`${API}/auctions/${rfqId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    const data = await res.json();

    if (!res.ok) {
      console.log("Fetch details failed");
      return;
    }

    setBidsMap((prev) => ({
      ...prev,
      [rfqId]: (data.bids || []).map((b) => ({
        __backendId: b._id,
        carrier_name: b.supplierId?.name || "Supplier",   // 🔥 FIX
        total_bid: b.amount,
        bid_time: b.createdAt,
        freight_charges: b.freightCharges,
        origin_charges: b.originCharges,
        destination_charges: b.destinationCharges,
        transit_time: b.transitTime,
        quote_validity: b.quoteValidity,
      })),
    }));

    setLogsMap((prev) => ({
      ...prev,
      [rfqId]: (data.logs || []).map((l) => ({
        log_message: l.message,
        log_time: l.createdAt,
      })),
    }));
  } catch (err) {
    console.log(err);
  }
}, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
        fetchAuctions();
    }
  }, [fetchAuctions]);

  // ── SELECTORS ─────────────────────────────────
  const getRFQs = useCallback(() => allData, [allData]);

  const getBidsForRFQ = useCallback(
    (rfqId) => bidsMap[rfqId] || [],
    [bidsMap]
  );

  const getLogsForRFQ = useCallback(
    (rfqId) => logsMap[rfqId] || [],
    [logsMap]
  );

  const stats = {
    rfqs: allData.length,
    bids: Object.values(bidsMap).flat().length,
    active: allData.filter((r) => getAuctionStatus(r) === "Active").length,
  };

  // ── TOAST ─────────────────────────────────
  const showToast = useCallback((msg, isError = false) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, msg, isError }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  // ── SOCKET LISTENERS ─────────────────────────────
  useEffect(() => {
    const handleNewBid = ({ auctionId }) => {
      fetchDetails(auctionId);
      fetchAuctions();
    };
    const handleExtension = ({ auctionId }) => {
      fetchDetails(auctionId);
      fetchAuctions();
      showToast("Auction extended!");
    };
    socket.on("newBid", handleNewBid);
    socket.on("auctionExtended", handleExtension);
    return () => {
      socket.off("newBid", handleNewBid);
      socket.off("auctionExtended", handleExtension);
    };
  }, [showToast, fetchDetails, fetchAuctions]);

  // ── CREATE RFQ ─────────────────────────────
  const createRFQ = async (payload) => {
    try {
      const res = await fetch(`${API}/auctions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          name: payload.rfq_name,
          bidStartTime: payload.bid_start,
          bidCloseTime: payload.bid_close,
          forcedCloseTime: payload.forced_close,
          triggerWindow: payload.trigger_window,
          extensionDuration: payload.extension_duration,
          triggerType: mapBackTrigger(payload.extension_trigger),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        showToast(data.message || "Error creating RFQ", true);
        return false;
      }

      showToast("RFQ created");
      await fetchAuctions();
      // console.log("Fetched auctions:", data);
      return true;
    } catch {
      showToast("Error creating RFQ", true);
      return false;
    }
  };

  // ── SUBMIT BID ─────────────────────────────
  const submitBid = async (rfqId, payload) => {
    const total = payload.freight + payload.origin + payload.dest;

    try {
      const res = await fetch(`${API}/bids`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          auctionId: rfqId,
          freight: payload.freight,
          origin: payload.origin,
          dest: payload.dest,
          transitTime: payload.transitTime,
          quoteValidity: payload.quoteValidity,
        }),
      });

      const data = await res.json();  // ← always read the body

      if (!res.ok) {
        showToast(data.message || "Bid failed", true);  // ← show actual backend message
        return false;
      }

      showToast("Bid submitted");
      return true;
    } catch {
      showToast("Bid failed", true);
      return false;
    }
  };

  // ── DELETE RFQ ─────────────────────────────
  const deleteRFQ = async (rfqId) => {
    try {
      const res = await fetch(`${API}/auctions/${rfqId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const data = await res.json();   // 🔥 ADD THIS

      if (!res.ok) {
        showToast(data.message || 'Error deleting auction', true); // 🔥 FIX
        return false;
      }

      showToast('Auction deleted');
      fetchAuctions();
      return true;

    } catch {
      showToast('Error deleting auction', true);
      return false;
    }
  };

  return {
    allData,
    getRFQs,
    getBidsForRFQ,
    getLogsForRFQ,
    stats,
    toasts,
    showToast,
    createRFQ,
    deleteRFQ,
    submitBid,
    fetchDetails,
  };
}