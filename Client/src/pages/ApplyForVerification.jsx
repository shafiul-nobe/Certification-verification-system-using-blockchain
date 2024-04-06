import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import erc20ABI from "../config/erc20ABI.json";
import { ethers } from "ethers";
import ethereumConfig from "../config/ethereum";
import Success from "../components/Success/Success";
import { Link, useNavigate } from "react-router-dom";
import ErrorAnimation from "../components/Error/ErrorAnimation";

function ApplyForVerification() {
  const [inputs, setInputs] = useState({
    _serialNumber: "",
    _studentName: "",
    _studentId: "",
    _graduationDate: "",
    _dateOfBirth: "",
    _institutionId: "",
    _programId: "",
  });

  const [imageUrl, setImageUrl] = useState("");
  const [uploadPercentage, setUploadPercentage] = useState(0);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    setUploadPercentage(0);
    setImageUrl("");
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            pinata_api_key: "2ac2736cbfe1582ceb44",
            pinata_secret_api_key:
              "5024c7a3beb02b3c9fca0e95fe73ef569f9e8ddcedaca629cce70c8d0cefc7dd",
          },
          onUploadProgress: (progressEvent) => {
            const percentage = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadPercentage(percentage);
          },
        }
      );
      setImageUrl(
        `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`
      );
    } catch (error) {
      console.error("Error uploading image to IPFS:", error);
    }
  };

  const handleInputChange = (e) => {
    setInputs((s) => ({
      ...s,
      [e.target.name]: e.target.value,
    }));
  };

  const [formStatus, setFormStatus] = useState("init"); // init | processing | success | error
  const modalRef = useRef(null);
  const [trxHash, setTrxHash] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (imageUrl.length === 0) {
      return alert("Please select an image");
    }
    try {
      const data = {
        ...inputs,
        _ipfsUrl: imageUrl,
      };

      let valid = true;
      for (const key in data) {
        if (data[key] === "") valid = false;
      }

      if (!valid) return alert("Please fill all the fields");

      if (!window.ethereum) return alert("Please Install MetaMask!");

      // Open the modal
      modalRef.current.showModal();
      setFormStatus("processing");

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        ethereumConfig.address,
        erc20ABI,
        signer
      );

      const res = await contract.applyForVerification(
        data._serialNumber,
        data._studentName,
        data._studentId,
        data._graduationDate,
        data._dateOfBirth,
        1,
        1,
        data._ipfsUrl,
        {
          gasLimit: ethers.utils.hexlify(7500000),
          value: ethers.utils.parseEther("0.0006"),
        }
      );

      const receipt = await res.wait();
      console.log(receipt);
      setTrxHash(receipt.transactionHash);
      setFormStatus("success");
    } catch (error) {
      console.error(error);
      setFormStatus("error");
    }
  };

  const [institutes, setInstitutes] = useState([]);
  const [programs, setPrograms] = useState([]);

  const getInstitutes = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(
      ethereumConfig.address,
      erc20ABI,
      signer
    );

    const res = await contract.getinstitutions();

    const sanitized = res.map((institute, index) => {
      const { name, location, country, programs, totalPrograms } = institute;
      return { name, location, country, programs, totalPrograms };
    });
    setInstitutes(sanitized);
  };

  useEffect(() => {
    if (!window.ethereum) return alert("Please Install MetaMask!");
    getInstitutes();
  }, []);

  useEffect(() => {
    if (inputs._institutionId) {
      const programLength = parseInt(
        institutes[inputs._institutionId].totalPrograms._hex,
        16
      );

      setInputs((prev) => {
        return {
          ...prev,
          _programId: "",
        };
      });

      setPrograms(
        institutes[inputs._institutionId].programs.slice(0, programLength)
      );
    }
  }, [inputs._institutionId]);

  return (
    <div className="px-6 md:px-10 pt-6 pb-10 bg-gray-800">
      <dialog id="processing_modal" ref={modalRef} className="modal">
        <div className="modal-box">
          {formStatus === "processing" ? (
            <div className="flex flex-col justify-center items-center gap-3 py-4">
              <span className="loading loading-ring loading-lg"></span>
              <h1 className="text-lg">Processing...</h1>
            </div>
          ) : null}

          {formStatus === "success" ? (
            <div>
              <Success />
              <div className="text-center">
                Your application has been successfully submitted for
                verification.
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
                to="/student"
                className="btn btn-outline btn-error w-full mt-3"
              >
                Close
              </Link>
            </div>
          ) : null}

          {formStatus === "error" ? (
            <div className="flex flex-col justify-center items-center w-full">
              <ErrorAnimation />
              <div className="text-center text-red-500 mt-3">
                Submission failed!
              </div>

              <form method="dialog w-full">
                <button className="btn btn-outline btn-error w-full mt-3">
                  Close
                </button>
              </form>
            </div>
          ) : null}
        </div>
      </dialog>
      <div>
        <div className="grid grid-cols-3 bg-gray-900 shadow-lg p-3 rounded-lg mb-6">
          <div className="flex justify-start items-center">
            <button className="p-2" onClick={() => window.history.back()}>
              Back
            </button>
          </div>
          <div className="flex justify-center items-center text-base md:text-2xl font-semibold ">
            Apply for Verification
          </div>
          <div className="flex justify-end items-center"></div>
        </div>
        <form className="flex justify-center items-center">
          <div className="grid grid-cols-1 gap-4 w-[500px]">
            <div className="col-span-1">
              <div className="bg-gray-700 h-52 rounded mb-2 border-2 border-dashed border-gray-400 flex justify-center items-center">
                {imageUrl ? (
                  <img src={imageUrl} className="h-[180px] rounded shadow" />
                ) : (
                  "Select an image"
                )}
              </div>
              <input
                type="file"
                className="file-input file-input-bordered file-input-primary w-full"
                accept="image/*"
                onChange={handleFileChange}
              />
              {uploadPercentage === 0 ? null : (
                <progress
                  className="progress progress-primary w-full"
                  value={uploadPercentage}
                  max="100"
                ></progress>
              )}
            </div>
            <div className="flex flex-col justify-start items-start gap-2">
              <label>Serial Number:</label>
              <input
                type="text"
                placeholder="Serial Number"
                className="input input-bordered input-primary w-full"
                name="_serialNumber"
                value={inputs._serialNumber}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="flex flex-col justify-start items-start gap-2">
              <label>Student Name:</label>
              <input
                type="text"
                placeholder="Student Name"
                className="input input-bordered input-primary w-full"
                name="_studentName"
                value={inputs._studentName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="flex flex-col justify-start items-start gap-2">
              <label>Student ID:</label>
              <input
                type="text"
                placeholder="Student ID"
                className="input input-bordered input-primary w-full"
                name="_studentId"
                value={inputs._studentId}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="flex flex-col justify-start items-start gap-2">
              <label>Graduation Date:</label>
              <input
                type="date"
                className="input input-bordered input-primary w-full"
                name="_graduationDate"
                value={inputs._graduationDate}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="flex flex-col justify-start items-start gap-2">
              <label>Date of Birth:</label>
              <input
                type="date"
                className="input input-bordered input-primary w-full"
                name="_dateOfBirth"
                value={inputs._dateOfBirth}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="flex flex-col justify-start items-start gap-2">
              <label>Select Your Institute:</label>
              <select
                className="select select-primary w-full"
                name="_institutionId"
                value={inputs._institutionId}
                onChange={handleInputChange}
                required
              >
                <option value={""} disabled>
                  Select Your Institute
                </option>
                {institutes.map((inst, index) => {
                  return (
                    <option key={index} value={index}>
                      {`${inst.name}, ${inst.location}, ${inst.country}`}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="flex flex-col justify-start items-start gap-2">
              <label>Select Your Program:</label>
              <select
                className="select select-primary w-full"
                name="_programId"
                value={inputs._programId}
                onChange={handleInputChange}
                disabled={inputs._institutionId.length === 0}
                required
              >
                <option value={""}>Select Your Program</option>
                {programs.map((prog, index) => {
                  return (
                    <option key={index} value={index}>
                      {`${prog.programType} in ${prog.title}`}
                    </option>
                  );
                })}
              </select>
            </div>
            <div className="col-span-1">
              <button onClick={handleSubmit} className="btn btn-primary w-full">
                Submit
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ApplyForVerification;
