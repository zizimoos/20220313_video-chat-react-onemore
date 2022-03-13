import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import styled from "styled-components";

const socket = io("http://localhost:3003");

const Container = styled.div`
  width: 100vw;
  height: 100vh;
  padding: 50px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
`;
const DisplayBox = styled.div`
  width: 500px;
  margin-bottom: 50px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const RoomForm = styled.form``;
const RoomInput = styled.input``;
const RoomButton = styled.button``;

const VideoBox = styled.div`
  margin-bottom: 50px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;
const Video = styled.video`
  width: 200px;

  border-radius: 10px;
  border: 5px solid dimgrey;
`;
const VideoButtonBox = styled.div``;
const VideoButton = styled.button``;
const CameraSelect = styled.select``;

function App() {
  const myVideo = useRef(null);
  const otherVideo = useRef(null);

  const [myStream, setMyStream] = useState(null);
  // const [myPeerConnection, setMyPeerConnection] = useState();
  let myPeerConnection;

  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [cameras, setCameras] = useState([]);
  const [deviceId, setDeviceId] = useState();

  const [roomName, setRoomName] = useState("");
  const [welcome, setWelcome] = useState(false);

  function handleMute() {
    myStream
      .getAudioTracks()
      .forEach((track) => (track.enabled = !track.enabled));
    muted ? setMuted(false) : setMuted(true);
  }
  const handleCamera = () => {
    myStream
      .getVideoTracks()
      .forEach((track) => (track.enabled = !track.enabled));
    cameraOff ? setCameraOff(false) : setCameraOff(true);
  };
  const getCameras = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const checkcameras = devices.filter(
        (device) => device.kind === "videoinput"
      );
      setCameras(checkcameras);
    } catch (error) {
      console.log(error);
    }
  };
  const handleCameraChange = async (e) => {
    await getMedia(e.target.value);
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    socket.emit("join_room", roomName, wellcomMessage);
  };
  const wellcomMessage = async () => {
    setWelcome(true);
    await makeConnection();
  };

  const getMedia = async (deviceId) => {
    const initialConstrains = {
      audio: true,
      video: { facingMode: "user" },
    };
    const cameraConstraints = {
      audio: true,
      video: { deviceId: { exact: deviceId } },
    };
    try {
      const stream = await navigator.mediaDevices.getUserMedia(
        deviceId ? cameraConstraints : initialConstrains
      );
      myVideo.current.srcObject = stream;
      setMyStream(stream);
      if (!deviceId) {
        await getCameras();
      }
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    getMedia();
  }, []);

  socket.on("welcome", async (id) => {
    console.log(`${id} joined`);
    const offer = await myPeerConnection.createOffer();
    await myPeerConnection.setLocalDescription(offer);
    console.log(`sent the offer`);
    socket.emit("offer", offer, roomName);
  });

  const makeConnection = () => {
    myPeerConnection = new RTCPeerConnection();
    myStream
      .getTracks()
      .forEach((track) => myPeerConnection.addTrack(track, myStream));
  };

  socket.on("offer", async (offer) => {
    console.log(`received the offer`);
    await myPeerConnection.setRemoteDescription(offer);

    const answer = await myPeerConnection.createAnswer();
    await myPeerConnection.setLocalDescription(answer);
    console.log(answer);
    socket.emit("answer", answer);
  });

  return (
    <Container>
      <h1>HELLO WORLD</h1>
      <DisplayBox>
        <RoomForm onSubmit={handleSubmit}>
          <RoomInput
            type="text"
            placeholder="Room Name"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
          />
          <RoomButton>ENTER ROOM</RoomButton>
        </RoomForm>
        {welcome ? <h2>{`welcome THE ${roomName}`}</h2> : null}
      </DisplayBox>
      <VideoBox>
        <Video ref={myVideo} autoPlay muted playsInline></Video>
        <VideoButtonBox>
          <VideoButton onClick={handleMute}>
            {muted ? "unMute" : "Muted"}
          </VideoButton>
          <VideoButton onClick={handleCamera}>
            {cameraOff ? "camera On" : "camera Off"}
          </VideoButton>
        </VideoButtonBox>
        <CameraSelect onChange={handleCameraChange}>
          {cameras.map((camera, index) => (
            <option key={index} value={camera.deviceId}>
              {camera.label}
            </option>
          ))}
        </CameraSelect>
      </VideoBox>
      <VideoBox>
        <Video ref={otherVideo} autoPlay muted playsInline></Video>
      </VideoBox>
    </Container>
  );
}

export default App;
