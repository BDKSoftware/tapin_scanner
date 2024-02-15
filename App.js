import { CameraView, useCameraPermissions } from "expo-camera/next";
import { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Keyboard,
} from "react-native";
import app from "./firebase";
import { getDoc, doc, updateDoc, getFirestore } from "firebase/firestore";

export default function App() {
  const [facing, setFacing] = useState("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [barCodeData, setBarCodeData] = useState("");
  const [hasBeenScanned, setHasBeenScanned] = useState(false);
  const [scanData, setScanData] = useState([]);
  const [pin, setPin] = useState("");
  const [isCorrectPin, setIsCorrectPin] = useState(false);
  const db = getFirestore(app);

  useEffect(() => {
    requestPermission();
  }, []);

  useEffect(() => {
    // reset hasBeenScanned after 5 seconds
    const timer = setTimeout(() => {
      setHasBeenScanned(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, [hasBeenScanned]);

  const getUserNameById = async (id) => {
    let docRef = doc(db, "user", id);
    let user = "";
    await getDoc(docRef)
      .then((doc) => {
        user = doc.data().email;
      })
      .catch((error) => {
        console.log("Error getting document:", error);
      });

    return user;
  };

  const getCurrentDate = () => {
    const date = new Date();
    const day = date.getDate();

    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    return `${month}/${day}/${year}`;
  };

  const handleScan = async (data) => {
    setHasBeenScanned(true);
    console.log(data);
    let docRef = doc(db, "ticket", data);

    await getDoc(docRef)
      .then(async (doc) => {
        if (doc.data().hasBeenScanned) {
          alert("Ticket has already been redeemed! Please try another ticket");
          return;
        }
        await updateDoc(docRef, {
          hasBeenScanned: true,
          dateScanned: getCurrentDate(),
        });

        await getUserNameById(doc.data().user).then((user) =>
          setScanData((prevData) => [
            {
              user: user,
              eventName: doc.data().eventName,
              dateScanned: getCurrentDate(),
            },
            ...prevData,
          ])
        );

        alert("Ticket has been scanned");
      })

      .catch((error) => {
        console.log("Error getting document:", error);
      });
  };

  function handleSubmit() {
    if (pin === "4646") {
      setIsCorrectPin(true);
      Keyboard.dismiss();
    } else {
      alert("Incorrect Pin");
      setPin("");
    }
  }

  function AppView() {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Tap In Ticket Scanner</Text>
        <View style={styles.cameraView}>
          <CameraView
            style={styles.camera}
            facing={facing}
            onBarcodeScanned={(data) => {
              if (!hasBeenScanned) {
                handleScan(data.data);
              }
            }}
            barcodeScannerSettings={{
              barCodeTypes: ["qr", "pdf417"],
            }}
          >
            <View style={styles.square}></View>
          </CameraView>
        </View>
        <View style={styles.pastScanDataContainer}>
          <View style={styles.pastScanData}>
            <Text style={{ width: "50%" }}>EMAIL:</Text>
            <Text style={{ width: "25%" }}>EVENT:</Text>
            <Text style={{ width: "25%" }}>DATE:</Text>
          </View>
          {scanData.map((data, index) => {
            return (
              <View key={index} style={styles.pastScanData}>
                <Text style={{ width: "50%" }}>{data.user}</Text>
                <Text style={{ width: "25%" }}>{data.eventName}</Text>
                <Text style={{ width: "25%" }}>{data.dateScanned}</Text>
              </View>
            );
          })}
        </View>
      </SafeAreaView>
    );
  }

  return isCorrectPin ? (
    <AppView />
  ) : (
    <SafeAreaView style={styles.pinContainer}>
      <Text style={styles.pinTitle}>Enter Pin</Text>
      <TextInput
        style={styles.pinInput}
        value={pin}
        onChangeText={(text) => setPin(text)}
        keyboardType="phone-pad"
        secureTextEntry={true}
        placeholder="Pin"
        maxLength={4}
        returnKeyType="done"
        returnKeyLabel="done"
        onSubmitEditing={handleSubmit}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#3c4142",
    alignItems: "center",
    justifyContent: "space-evenly",
  },

  pinContainer: {
    flex: 1,
    backgroundColor: "#3c4142",
    alignItems: "center",
    justifyContent: "flex-start",
  },

  cameraView: {
    width: "95%",
    height: "40%",
  },

  camera: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },

  square: {
    width: 200,
    height: 200,
    borderWidth: 2,
    borderColor: "yellow",
    borderRadius: 20,
    borderStyle: "dashed",
  },

  pastScanDataContainer: {
    width: "100%",
    height: "50%",
    backgroundColor: "white",
  },

  title: {
    fontSize: 30,
    color: "white",
  },

  pinTitle: {
    fontSize: 30,
    color: "white",
    marginBottom: 200,
  },

  pastScanData: {
    width: "100%",
    height: 50,
    backgroundColor: "white",
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
    paddingHorizontal: 20,
    borderBottomColor: "black",
    borderBottomWidth: 1,
  },

  pinInput: {
    width: "20%",
    height: 40,
    borderRadius: 5,
    marginBottom: 20,
    textAlign: "center",
    borderColor: "white",
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    marginBottom: 200,
  },

  pinButton: {
    width: "20%",
    height: 40,
    borderRadius: 5,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },

  pinButtonText: {
    color: "black",
    fontWeight: "bold",
  },
});
