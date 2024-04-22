import React, { useEffect, useState } from "react";
import erc20ABI from "../../../config/erc20ABI.json";
import { ethers } from "ethers";
import ethereumConfig from "../../../config/ethereum";
import { Link, useParams } from "react-router-dom";
import Success from "../../../components/Success/Success";
import { IoHome } from "react-icons/io5";
import { FaArrowLeft } from "react-icons/fa";

const CertificatesOfInstitute = () => {
  const [certificates, setCertificates] = useState([]);
  const [institueInfo, setInstitueInfo] = useState({});
  const [detailsIdx, setDetailsIdx] = useState(-1);
  const [certificateId, setCertificateId] = useState(-1);
  const [verificationProcessStatus, setVerificationProcessStatus] =
    useState("init");
  const [trxHash, setTrxHash] = useState(null);
  const [aboutInstitues, setAboutInstitues] = useState({});
  const [programInfo, setProgramInfo] = useState([]);
  const [dataLength, setDataLength] = useState(0);

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
    const _allInstitutes = contract.getinstitutions();

    const [res, institueInfo, allInstitutes] = await Promise.all([
      _res,
      _institueInfo,
      _allInstitutes,
    ]);
    setInstitueInfo(institueInfo);

    setAboutInstitues(
      allInstitutes.filter(
        (e) => parseInt(e.id._hex, 16) === parseInt(params.id)
      )[0]
    );

    setProgramInfo(
      allInstitutes
        .filter((e) => parseInt(e.id._hex, 16) === parseInt(params.id))[0]
        .programs.filter((e) => e[1] !== "")
    );

    let reversed = [];

    for (let i = res.length - 1; i >= 0; i--) {
      if (res[i].primaryVerified && !res[i].verified) {
        reversed.push(res[i]);
      }
    }
    setDataLength(reversed.length);

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
      setTrxHash(trx.transactionHash);
      setVerificationProcessStatus("success");
    } catch (error) {
      console.log(error);
      setVerificationProcessStatus("error");
      window.document.getElementById("confirmModal").click();
    }
  };

  if (!window.ethereum) return <div>Install Metamask in Your Browser</div>;
  return (
    <div className="p-4 md:p-10 bg-gradient-to-t from-cyan-950 to-teal-800 min-h-[80vh]">
      <div className="grid grid-cols-3 bg-gray-800 shadow-lg p-3 rounded-lg mb-6">
        <div className="flex justify-start items-center gap-4">
          <button className="p-2" onClick={() => window.history.back()}>
            <FaArrowLeft />
          </button>
          <div className="flex justify-start items-center gap-2">
            <Link to="/">
              <IoHome size={18} />
            </Link>
            <span>/</span>
            <Link to="/secondary-verifier" className="font-semibold">
              Secondary Verifier
            </Link>
            <span>/</span>
            <span className="text-gray-400">
              Certificates of {institueInfo.name}
            </span>
          </div>
        </div>
        <div className="flex justify-center items-center text-base md:text-xl font-semibold ">
          {institueInfo.name?.toUpperCase()}
        </div>
        <div className="flex justify-end items-center"></div>
      </div>
      <dialog id="confirm-verify" className="modal">
        <div className="modal-box">
          {verificationProcessStatus === "success" ? (
            <div>
              <Success />
              <div className="text-center font-semibold text-green-500">
                The certificate has been verified.
              </div>
              <div className="break-all mt-3">
                Transaction Hash:{" "}
                <span className="bg-gray-200/20 px-2 rounded-md text-gray-200">
                  {trxHash}
                </span>
              </div>
              <a
                href={`https://sepolia.etherscan.io/tx/${trxHash}`}
                target="_blank"
                className="btn btn-primary w-full mt-4"
              >
                View in Blockchain
              </a>
              <Link
                to="/secondary-verifier"
                className="btn btn-outline btn-error w-full mt-3"
              >
                Close
              </Link>
            </div>
          ) : (
            <>
              <h3 className="font-bold text-lg">Are you sure?</h3>
              <p className="pt-4">
                Do you acknoledge this certificate for verification? Your action
                cannot be reverted!
              </p>
              <div className="modal-action">
                <button className="btn btn-success" onClick={verifyCertificate}>
                  {verificationProcessStatus === "loading" ? (
                    <span className="loading loading-ring loading-md"></span>
                  ) : null}
                  Confirm
                </button>
                <form method="dialog">
                  <button
                    id="confirmModal"
                    className="btn btn-outline btn-error"
                  >
                    Cancel
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </dialog>
      <dialog id="certificate-desc" className="modal">
        <div className="modal-box">
          <div className="w-full">
            <img
              src={certificates[detailsIdx]?.ipfsUrl}
              className="w-full min-h-[16rem] bg-gray-400 rounded"
            />
          </div>
          <div className="w-full flex justify-center items-center pt-3 pb-2 text-lg font-semibold">
            Details
          </div>
          <div className="grid grid-cols-3">
            <div className="col-span-1 border border-collapse border-gray-500 p-2">
              Student ID
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
              Date of Birth
            </div>
            <div className="col-span-2 border border-collapse border-gray-500 p-2">
              {certificates[detailsIdx]?.dateOfBirth}
            </div>

            <div className="col-span-1 border border-collapse border-gray-500 p-2">
              Institute Name
            </div>
            <div className="col-span-2 border border-collapse border-gray-500 p-2 uppercase">
              {aboutInstitues.name}
            </div>

            <div className="col-span-1 border border-collapse border-gray-500 p-2">
              Program Type
            </div>
            <div className="col-span-2 border border-collapse border-gray-500 p-2 capitalize">
              {
                programInfo.filter((e) => {
                  return e.id._hex === certificates[detailsIdx]?.programId._hex;
                })[0]?.programType
              }
            </div>

            <div className="col-span-1 border border-collapse border-gray-500 p-2">
              Major
            </div>
            <div className="col-span-2 border border-collapse border-gray-500 p-2 capitalize">
              {
                programInfo.filter((e) => {
                  return e.id._hex === certificates[detailsIdx]?.programId._hex;
                })[0]?.major
              }
            </div>

            <div className="col-span-1 border border-collapse border-gray-500 p-2">
              Graduation Date
            </div>
            <div className="col-span-2 border border-collapse border-gray-500 p-2">
              {certificates[detailsIdx]?.graduationDate}
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
      <div className="overflow-x-auto bg-teal-400/30 backdrop-blur-lg rounded-md shadow-lg">
        <table className="table">
          <thead>
            <tr className="text-base">
              <th>ID</th>
              <th>Student ID</th>
              <th>Student Name</th>
              <th>Serial Number</th>
              <th align="center">Program Type</th>
              <th align="center">Major</th>
              <th align="center">Graduation Date</th>
              <th align="center">Status</th>
            </tr>
          </thead>
          <tbody>
            {dataLength === 0 ? (
              <tr>
                <td colSpan={8} align="center">
                  No new request for verification
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
                    className="cursor-pointer hover:bg-teal-500/40"
                  >
                    <th>{parseInt(cert.id._hex, 16)}</th>
                    <td>{cert.studentId}</td>
                    <td>{cert.studentName}</td>
                    <td>{cert.serialnumber}</td>
                    <td align="center" className="capitalize">
                      {
                        programInfo.filter((e) => {
                          return e.id._hex === cert.programId._hex;
                        })[0].programType
                      }
                    </td>

                    <td align="center" className="capitalize">
                      {
                        programInfo.filter((e) => {
                          return e.id._hex === cert.programId._hex;
                        })[0].major
                      }
                    </td>
                    <td align="center">{cert.graduationDate}</td>
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
