import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import { CgUnavailable } from "react-icons/cg";
import erc20ABI from "../../../config/erc20ABI.json";
import { GoVerified } from "react-icons/go";
import { useParams } from "react-router-dom";
import ethereumConfig from "../../../config/ethereum";

const VerifyCertificates = () => {
  const [status, setStatus] = useState("loading"); // "loading" || "success" || "invalid"
  const [certificate, setCertificate] = useState({});
  const [instituteName, setInstituteName] = useState("");
  const [programInfo, setProgramInfo] = useState({});
  const params = useParams();

  const getCertificate = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        ethereumConfig.address,
        erc20ABI,
        signer
      );

      const _res = contract.getOnlyVerifiedCertificateByID(params.id);
      const _getinstitutions = contract.getinstitutions();
      const [res, getinstitutions] = await Promise.all([
        _res,
        _getinstitutions,
      ]);

      setCertificate(res);
      const institute = getinstitutions.filter((inst) => {
        return inst.id._hex === res.institutionId._hex;
      });
      setInstituteName(institute[0].name);

      const prog = institute[0].programs.filter((prog) => {
        return prog.id._hex === res.programId._hex;
      });

      setProgramInfo(prog[0]);

      if (res.verified) {
        setStatus("success");
      } else {
        setStatus("invalid");
      }
    } catch (error) {
      console.log(error);
      setStatus("invalid");
    }
  };

  useEffect(() => {
    getCertificate();
  }, []);

  if (status === "loading")
    return (
      <div className="px-10">
        <div className="flex justify-between items-start gap-10">
          <div className="min-h-[400px] w-1/3 bg-gray-200/30 animate-pulse delay-0 rounded-md"></div>

          <div className="flex-grow">
            <div className="flex justify-start items-center gap-3 text-2xl font-semibold font-serif uppercase bg-gray-100/30 px-6 py-4 rounded-md">
              <div className="w-8 h-8 rounded-full bg-gray-200/60 animate-pulse delay-75"></div>
              <div className="w-32 h-8 rounded-full bg-gray-200/60 animate-pulse delay-100"></div>
            </div>

            <div className="my-4">
              <div className="grid grid-cols-3 border border-collapse border-gray-500 rounded-md overflow-hidden">
                <div className="col-span-1 border-b border-r border-collapse border-gray-500 p-2">
                  <div className="w-32 h-5 rounded-full bg-gray-200/40 animate-pulse delay-100"></div>
                </div>
                <div className="col-span-2 border-b border-collapse border-gray-500 p-2">
                  <div className="w-32 h-5 rounded-full bg-gray-200/40 animate-pulse delay-100"></div>
                </div>

                <div className="col-span-1 border-b border-r border-collapse border-gray-500 p-2">
                  <div className="w-28 h-5 rounded-full bg-gray-200/40 animate-pulse delay-[125ms]"></div>
                </div>
                <div className="col-span-2 border-b border-collapse border-gray-500 p-2">
                  <div className="w-52 h-5 rounded-full bg-gray-200/40 animate-pulse delay-[125ms]"></div>
                </div>

                <div className="col-span-1 border-b border-r border-collapse border-gray-500 p-2">
                  <div className="w-36 h-5 rounded-full bg-gray-200/40 animate-pulse delay-150"></div>
                </div>
                <div className="col-span-2 border-b border-collapse border-gray-500 p-2">
                  <div className="w-36 h-5 rounded-full bg-gray-200/40 animate-pulse delay-150"></div>
                </div>

                <div className="col-span-1 border-b border-r border-collapse border-gray-500 p-2">
                  <div className="w-32 h-5 rounded-full bg-gray-200/40 animate-pulse delay-[175ms]"></div>
                </div>
                <div className="col-span-2 border-b border-collapse border-gray-500 p-2">
                  <div className="w-28 h-5 rounded-full bg-gray-200/40 animate-pulse delay-[175ms]"></div>
                </div>

                <div className="col-span-1 border-b border-r border-collapse border-gray-500 p-2">
                  <div className="w-20 h-5 rounded-full bg-gray-200/40 animate-pulse delay-[200ms]"></div>
                </div>
                <div className="col-span-2 border-b border-collapse border-gray-500 p-2">
                  <div className="w-60 h-5 rounded-full bg-gray-200/40 animate-pulse delay-[200ms]"></div>
                </div>

                <div className="col-span-1 border-b border-r border-collapse border-gray-500 p-2">
                  <div className="w-32 h-5 rounded-full bg-gray-200/40 animate-pulse delay-[225ms]"></div>
                </div>
                <div className="col-span-2 border-b border-collapse border-gray-500 p-2">
                  <div className="w-32 h-5 rounded-full bg-gray-200/40 animate-pulse delay-[225ms]"></div>
                </div>

                <div className="col-span-1 border-b border-r border-collapse border-gray-500 p-2">
                  <div className="w-32 h-5 rounded-full bg-gray-200/40 animate-pulse delay-[250ms]"></div>
                </div>
                <div className="col-span-2 border-b border-collapse border-gray-500 p-2">
                  <div className="w-32 h-5 rounded-full bg-gray-200/40 animate-pulse delay-[250ms]"></div>
                </div>

                <div className="col-span-1 border-b border-r border-collapse border-gray-500 p-2">
                  <div className="w-32 h-5 rounded-full bg-gray-200/40 animate-pulse delay-[275ms]"></div>
                </div>
                <div className="col-span-2 border-b border-collapse border-gray-500 p-2">
                  <div className="w-32 h-5 rounded-full bg-gray-200/40 animate-pulse delay-[275ms]"></div>
                </div>

                <div className="col-span-1 border-r border-collapse border-gray-500 p-2">
                  <div className="w-32 h-5 rounded-full bg-gray-200/40 animate-pulse delay-[300ms]"></div>
                </div>
                <div className="col-span-2 border-collapse border-gray-500 p-2">
                  <div className="w-32 h-5 rounded-full bg-gray-200/40 animate-pulse delay-[300ms]"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );

  if (status === "invalid") {
    return (
      <div className="w-full h-[72vh] bg-gray-300/20 flex justify-center items-center gap-4 text-4xl font-serif">
        <CgUnavailable size={40} /> This url is not valid
      </div>
    );
  }

  if (status === "success")
    return (
      <div className="px-10">
        <div className="flex justify-between items-start gap-10 w-full">
          <div className="min-h-[200px] max-w-[40%]">
            <img src={certificate.ipfsUrl} className="rounded max-w-full" />
          </div>

          <div className="flex-grow">
            <div className="flex justify-start items-center gap-3 text-2xl font-semibold font-serif uppercase bg-gray-100/30 px-6 py-4 rounded-md">
              <GoVerified /> Verified
            </div>

            <div className="my-4">
              <div className="grid grid-cols-3 border border-collapse border-gray-500 rounded-md overflow-hidden">
                <div className="col-span-1 border-b border-r border-collapse border-gray-500 p-2">
                  Serial Number
                </div>
                <div className="col-span-2 border-b border-collapse border-gray-500 p-2">
                  {certificate.serialnumber}
                </div>

                <div className="col-span-1 border-b border-r border-collapse border-gray-500 p-2">
                  Student ID
                </div>
                <div className="col-span-2 border-b border-collapse border-gray-500 p-2">
                  {certificate.studentId}
                </div>

                <div className="col-span-1 border-b border-r border-collapse border-gray-500 p-2">
                  Student Name
                </div>
                <div className="col-span-2 border-b border-collapse border-gray-500 p-2">
                  {certificate.studentName}
                </div>

                <div className="col-span-1 border-b border-r border-collapse border-gray-500 p-2">
                  Date of Birth
                </div>
                <div className="col-span-2 border-b border-collapse border-gray-500 p-2">
                  {certificate.dateOfBirth}
                </div>

                <div className="col-span-1 border-b border-r border-collapse border-gray-500 p-2">
                  Institute Name
                </div>
                <div className="col-span-2 border-b border-collapse border-gray-500 p-2 uppercase">
                  {instituteName}
                </div>

                <div className="col-span-1 border-b border-r border-collapse border-gray-500 p-2">
                  Program Name
                </div>
                <div className="col-span-2 border-b border-collapse border-gray-500 p-2 capitalize">
                  {programInfo.programType}
                </div>

                <div className="col-span-1 border-b border-r border-collapse border-gray-500 p-2 capitalize">
                  Major
                </div>
                <div className="col-span-2 border-b border-collapse border-gray-500 p-2">
                  {programInfo.major}
                </div>

                <div className="col-span-1 border-r border-collapse border-gray-500 p-2">
                  Graduation Date
                </div>
                <div className="col-span-2 border-collapse border-gray-500 p-2">
                  {certificate.graduationDate}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
};

export default VerifyCertificates;
