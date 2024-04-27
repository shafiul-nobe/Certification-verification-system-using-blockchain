import React, { useEffect, useState } from "react";
import erc20ABI from "../config/erc20ABI.json";
import { ethers } from "ethers";
import ethereumConfig from "../config/ethereum";
import { Link } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { IoHome } from "react-icons/io5";
import { LuLink2 } from "react-icons/lu";
import { TiTick } from "react-icons/ti";

const Student = () => {
  const [certificates, setCertificates] = useState([]);
  const [detailsIdx, setDetailsIdx] = useState(-1);
  const [copied, setCopied] = useState(false);
  const [allInstitutesData, setAboutInstituesData] = useState([]);

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

    const _res = contract.getCertificatesByApplicant(userAddress);
    const _allInstitutes = contract.getinstitutions();

    const [res, allInstitutes] = await Promise.all([_res, _allInstitutes]);

    setAboutInstituesData(allInstitutes);

    let reversed = Array.from({ length: res.length });
    res.forEach((item, idx) => {
      reversed[idx] = res[res.length - 1 - idx];
    });
    console.log(reversed);
    setCertificates(reversed);
  };

  useEffect(() => {
    getCertificates();
  }, []);

  if (!window.ethereum) return <div>Install Metamask in Your Browser</div>;
  return (
    <div className="p-4 md:p-10 bg-gradient-to-t from-gray-800 to-gray-700 min-h-[80vh]">
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
            <span className="text-gray-400">Student Panel</span>
          </div>
        </div>
        <div className="flex justify-center items-center text-base md:text-xl font-semibold ">
          Student Panel
        </div>
        <div className="flex justify-end items-center">
          <Link
            to="/student/apply"
            className="bg-primary text-gray-700 font-semibold px-3 py-2 text-lg rounded-md"
          >
            Apply
          </Link>
        </div>
      </div>
      <dialog id="certificate-desc" className="modal">
        <div className="modal-box">
          <div className={`w-full`}>
            <img
              src={certificates[detailsIdx]?.ipfsUrl}
              className="w-full bg-gray-500 rounded min-h-[12rem]"
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
              Institute Name
            </div>
            <div className="col-span-2 border border-collapse border-gray-500 p-2 uppercase">
              {
                allInstitutesData?.filter((item) => {
                  return (
                    item.id._hex ===
                    certificates[detailsIdx]?.institutionId._hex
                  );
                })[0]?.name
              }
            </div>

            <div className="col-span-1 border border-collapse border-gray-500 p-2">
              Program Type
            </div>
            <div className="col-span-2 border border-collapse border-gray-500 p-2 capitalize">
              {
                allInstitutesData
                  ?.filter((item) => {
                    return (
                      item.id._hex ===
                      certificates[detailsIdx]?.institutionId._hex
                    );
                  })[0]
                  .programs.filter(
                    (item) =>
                      !(
                        item.major.length === 0 &&
                        item.programType.length === 0 &&
                        item.title.length === 0
                      )
                  )
                  .filter((item) => {
                    return (
                      item.id._hex === certificates[detailsIdx]?.programId._hex
                    );
                  })[0]?.programType
              }
            </div>

            <div className="col-span-1 border border-collapse border-gray-500 p-2">
              Major
            </div>
            <div className="col-span-2 border border-collapse border-gray-500 p-2 capitalize">
              {
                allInstitutesData
                  ?.filter((item) => {
                    return (
                      item.id._hex ===
                      certificates[detailsIdx]?.institutionId._hex
                    );
                  })[0]
                  .programs.filter(
                    (item) =>
                      !(
                        item.major.length === 0 &&
                        item.programType.length === 0 &&
                        item.title.length === 0
                      )
                  )
                  .filter((item) => {
                    return (
                      item.id._hex === certificates[detailsIdx]?.programId._hex
                    );
                  })[0]?.title
              }
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
          {certificates[detailsIdx]?.verified ? (
            <button
              className="btn btn-primary w-full mt-3"
              onClick={() => {
                navigator.clipboard
                  .writeText(
                    `${window.location.origin}/certificates/verify/${certificates[detailsIdx]?.id}`
                  )
                  .then(() => {
                    setCopied(true);
                    setTimeout(() => setCopied(false), 3000);
                  });
              }}
            >
              {copied ? (
                <>
                  <TiTick /> Copied
                </>
              ) : (
                <>
                  <LuLink2 /> Copy Sharable Link
                </>
              )}
            </button>
          ) : null}

          <form method="dialog" className="modal-backdrop">
            <button
              className="btn btn-outline btn-error w-full mt-3"
              onClick={() => {
                setTimeout(() => setCopied(false), 400);
              }}
            >
              Close
            </button>
          </form>
        </div>
      </dialog>
      <div className="overflow-x-auto bg-gray-400/20 backdrop-blur-lg rounded-md shadow-lg">
        <table className="table">
          <thead>
            <tr className="text-base">
              <th></th>
              <th>Student ID</th>
              <th>Student Name</th>
              <th>Institute Name</th>
              <th>Program Name</th>
              <th>Major</th>
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
                    key={idx + 1}
                    onClick={() => {
                      setDetailsIdx(idx);
                      document.getElementById("certificate-desc").showModal();
                    }}
                    className="cursor-pointer hover:bg-gray-500/30"
                  >
                    <th>{parseInt(cert.id._hex, 16)}</th>
                    <td>{cert.studentId}</td>
                    <td>{cert.studentName}</td>
                    <td className="text-center">
                      {
                        allInstitutesData?.filter((item) => {
                          return item.id._hex === cert.institutionId._hex;
                        })[0]?.name
                      }
                    </td>
                    <td className="capitalize">
                      {
                        allInstitutesData
                          ?.filter((item) => {
                            return item.id._hex === cert.institutionId._hex;
                          })[0]
                          .programs.filter(
                            (item) =>
                              !(
                                item.major.length === 0 &&
                                item.programType.length === 0 &&
                                item.title.length === 0
                              )
                          )
                          .filter((item) => {
                            return item.id._hex === cert.programId._hex;
                          })[0].programType
                      }
                    </td>
                    <td className="capitalize">
                      {
                        allInstitutesData
                          ?.filter((item) => {
                            return item.id._hex === cert.institutionId._hex;
                          })[0]
                          .programs.filter(
                            (item) =>
                              !(
                                item.major.length === 0 &&
                                item.programType.length === 0 &&
                                item.title.length === 0
                              )
                          )
                          .filter((item) => {
                            return item.id._hex === cert.programId._hex;
                          })[0].title
                      }
                    </td>
                    {/*  */}
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

export default Student;
