import React, { useEffect, useState } from "react";
import erc20ABI from "../../config/erc20ABI.json";
import { ethers } from "ethers";
import ethereumConfig from "../../config/ethereum";
import { Link } from "react-router-dom";

const PrimaryVerification = () => {
  const [certificates, setCertificates] = useState([]);
  const [detailsIdx, setDetailsIdx] = useState(-1);
  const getCertificates = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const userAddress = signer.getAddress();
    const contract = new ethers.Contract(
      ethereumConfig.address,
      erc20ABI,
      signer
    );

    const _res = contract.getinstitutions();
    const _permitted = contract.getInstitutionsByPrimaryVerifier(userAddress);

    const [res, permitted] = await Promise.all([_res, _permitted]);
    const permitted_institutes = permitted.map((e, i) => e._hex);
    let reversed = Array.from({ length: res.length });
    res.forEach((item, idx) => {
      reversed[idx] = res[res.length - 1 - idx];
    });
    setCertificates(
      reversed.filter((item) => permitted_institutes.includes(item.id._hex))
    );
  };

  useEffect(() => {
    getCertificates();
  }, []);

  if (!window.ethereum) return <div>Install Metamask in Your Browser</div>;
  return (
    <div className="p-4 md:p-10 bg-gradient-to-t from-indigo-950 to-indigo-800 min-h-[80vh]">
      <div className="grid grid-cols-3 bg-gray-800 shadow-lg p-3 rounded-lg mb-6">
        <div className="flex justify-start items-center">
          <button className="p-2" onClick={() => window.history.back()}>
            Back
          </button>
        </div>
        <div className="flex justify-center items-center text-base md:text-2xl font-semibold">
          Primary Verification
        </div>
        <div className="flex justify-end items-center"></div>
      </div>
      <dialog id="certificate-desc" className="modal">
        <div className="modal-box">
          <div className="w-full">
            <img src={certificates[detailsIdx]?.ipfsUrl} className="w-full" />
          </div>
          <div className="w-full flex justify-center items-center pt-3 pb-2 text-lg font-semibold">
            Details
          </div>
          <div className="grid grid-cols-3">
            <div className="col-span-1 border border-collapse border-gray-500 p-2">
              Institute Name
            </div>
            <div className="col-span-2 border border-collapse border-gray-500 p-2">
              {certificates[detailsIdx]?.studentId}
            </div>

            <div className="col-span-1 border border-collapse border-gray-500 p-2">
              Student Name
            </div>
            <div className="col-span-2 border border-collapse border-gray-500 p-2">
              {certificates[detailsIdx]?.studentName}
            </div>

            <div className="col-span-1 border border-collapse border-gray-500 p-2">
              Graduation Date
            </div>
            <div className="col-span-2 border border-collapse border-gray-500 p-2">
              {certificates[detailsIdx]?.graduationDate}
            </div>

            <div className="col-span-1 border border-collapse border-gray-500 p-2">
              Date of Birth
            </div>
            <div className="col-span-2 border border-collapse border-gray-500 p-2">
              {certificates[detailsIdx]?.dateOfBirth}
            </div>

            <div className="col-span-1 border border-collapse border-gray-500 p-2">
              Status
            </div>
            <div className="col-span-2 border border-collapse border-gray-500 p-2">
              {certificates[detailsIdx]?.verified
                ? "Verified"
                : certificates[detailsIdx]?.primaryVerified
                ? "Primary Verified"
                : "Not Verified"}
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button className="btn btn-error w-full mt-3">Close</button>
          </form>
        </div>
      </dialog>
      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th></th>
              <th>Institute Name</th>
              <th>Location</th>
              <th>Country</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {certificates.length === 0 ? (
              <tr>
                <td colSpan={5} align="center">
                  No data found
                </td>
              </tr>
            ) : (
              certificates.map((cert, idx) => {
                return (
                  <tr key={idx} className="hover:bg-indigo-400/30">
                    <th>{idx + 1}</th>
                    <td>{cert.name}</td>
                    <td>{cert.location}</td>
                    <td>{cert.country}</td>
                    <td>
                      <Link to={`/primary-verifier/${parseInt(cert.id, 16)}`}>
                        <button className="btn btn-outline btn-primary">
                          Enter
                        </button>
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PrimaryVerification;
