import React, { useEffect, useState } from "react";
import erc20ABI from "../../../config/erc20ABI.json";
import { ethers } from "ethers";
import ethereumConfig from "../../../config/ethereum";
import { Link, useParams } from "react-router-dom";

const CertificatesOfInstitute = () => {
  const [certificates, setCertificates] = useState([]);
  const [institueInfo, setInstitueInfo] = useState({});
  const [detailsIdx, setDetailsIdx] = useState(-1);
  const [certificateId, setCertificateId] = useState(-1);
  const [verificationProcessStatus, setVerificationProcessStatus] =
    useState("init");

  const params = useParams();

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

    const _res = contract.getCertificatesByInstitutionId(params.id);
    const _institueInfo = contract.institutions(params.id);
    const [res, institueInfo] = await Promise.all([_res, _institueInfo]);
    setInstitueInfo(institueInfo);

    let reversed = Array.from({ length: res.length });
    res.forEach((item, idx) => {
      reversed[idx] = res[res.length - 1 - idx];
    });
    setCertificates(reversed);
  };

  useEffect(() => {
    getCertificates();
  }, []);

  const verifyCertificate = async () => {
    if (certificateId === -1 || verificationProcessStatus === "loading") return;
    try {
      setVerificationProcessStatus("loading");
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        ethereumConfig.address,
        erc20ABI,
        signer
      );

      const _res = contract.verify(certificateId, {
        gasLimit: ethers.utils.hexlify(7500000),
      });
      const [res] = await Promise.all([_res]);
      const trx = await res.wait();
      setVerificationProcessStatus("success");
      window.location.reload();
    } catch (error) {
      console.log(error);
    } finally {
      setVerificationProcessStatus("init");
    }
  };

  if (!window.ethereum) return <div>Install Metamask in Your Browser</div>;
  return (
    <div className="p-4 md:p-10 bg-gradient-to-t from-cyan-950 to-teal-800 min-h-[80vh]">
      <div className="grid grid-cols-3 bg-gray-800 shadow-lg p-3 rounded-lg mb-6">
        <div className="flex justify-start items-center">
          <button className="p-2" onClick={() => window.history.back()}>
            Back
          </button>
        </div>
        <div className="flex justify-center items-center text-base md:text-2xl font-semibold ">
          Certificates of {institueInfo.name}
        </div>
        <div className="flex justify-end items-center"></div>
      </div>
      <dialog id="confirm-verify" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Are you sure?</h3>
          <p className="pt-4">
            Do you acknoledge this certificate for primary verification? Your
            action cannot be reverted!
          </p>
          <div className="modal-action">
            <button className="btn btn-success" onClick={verifyCertificate}>
              {verificationProcessStatus === "loading" ? (
                <span className="loading loading-ring loading-md"></span>
              ) : null}
              Confirm
            </button>
            <form method="dialog">
              <button className="btn btn-outline btn-error">Cancel</button>
            </form>
          </div>
        </div>
      </dialog>
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

          {certificates[detailsIdx]?.verified ? null : (
            <div>
              <button
                className="btn btn-success w-full mt-3"
                onClick={() => {
                  window.document.getElementById("confirm-verify").showModal();
                }}
              >
                Verify
              </button>
            </div>
          )}

          <form method="dialog" className="modal-backdrop">
            <button className="btn btn-error w-full mt-3">Close</button>
          </form>
        </div>
      </dialog>
      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr className="text-base">
              <th></th>
              <th>Student ID</th>
              <th>Student Name</th>
              <th>Serial Number</th>
              <th>Graduation Date</th>
              <th>Date of Birth</th>
              <th align="center">Status</th>
            </tr>
          </thead>
          <tbody>
            {certificates.length === 0 ? (
              <tr>
                <td colSpan={7} align="center">
                  No data found
                </td>
              </tr>
            ) : (
              certificates.map((cert, idx) => {
                return (
                  <tr
                    key={idx}
                    onClick={() => {
                      setDetailsIdx(idx);
                      setCertificateId(cert.id);
                      document.getElementById("certificate-desc").showModal();
                    }}
                    className="cursor-pointer"
                  >
                    <th>{idx}</th>
                    <td>{cert.studentId}</td>
                    <td>{cert.studentName}</td>
                    <td>{cert.serialnumber}</td>
                    <td>{cert.graduationDate}</td>
                    <td>{cert.dateOfBirth}</td>
                    <td align="center">
                      {cert.verified ? (
                        <span className="text-green-500">Verified</span>
                      ) : cert.primaryVerified ? (
                        <span className="text-yellow-500">
                          Primary Verified
                        </span>
                      ) : (
                        <span className="text-red-500">Not Verified</span>
                      )}
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

export default CertificatesOfInstitute;
