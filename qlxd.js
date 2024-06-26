// =======================================
// 		VARS
// =======================================
var todo = false;
var string= "" ;
var ch = 1 ;
var model = "SHURE QLX-D" ;
var contain = {
	"name"	:		["Name", "s", "CHAN_NAME"],
	"trans" : 		["Transmitter", "s","TX_TYPE"],
	"gain" : 		["Audio Gain", "s","AUDIO_GAIN"],
	"txoffset" : 	["Gain Offset", "s","TX_OFFSET"],
	"txmute" : 		["Mute", "s","TX_MUTE_STATUS "],
	"rfpower" : 	["RF Power", "s","TX_RF_PWR"],
	"frequ" : 		["Frequency", "s","FREQUENCY"],
	"rfgroup" : 	["RF Group", "s","GROUP_CHAN"],
	"rfchann" : 	["RF Channel", "s",""],
	"antenna" : 	["Antenna", "s","RF_ANTENNA"],
	"rflvl" : 		["RF", "s", ""],
	"rfgpeak" : 	["RF Level", "f1", "RX_RF_LVL"],
	"audiolvl" : 	["Audio", "s", ""],
	"audlvlpk" : 	["Audio Level", "f2", "AUDIO_LVL"],	
	"encrypt" : 	["Encryption", "s", ""],
	"battrun" : 	["Battery Runtime", "s", "BATT_RUN_TIME"],
	"battcycle" : 	["Battery Cycles", "s", ""],
	"battype" : 	["Battery Type", "s", "BATT_TYPEBATT_CYCLE"],
	"battcharge" : 	["Battery Charge", "f3", "BATT_BARS"],
	"battbars" : 	["Battery Bars", "en", ""]};

// =======================================
//		FUNCTION INIT
// =======================================

function init() {
  	getAll();
  
//------------------ Insert Parameters ------------------------
	reset = local.parameters.addTrigger("Reset" , "Reset Update Rate Values" , false);
  	rCh= local.parameters.addEnumParameter("Feedback", "Update Rate","no Updates","00000","very slow (15sec)","15000","slow (5sec)","05000","medium (2,5sec)","02500","fast (1sec)","01000","faster (0,5sec)","00500","very fast (0.2sec)","00200","fastest (0,1sec)","00100");
	
  
// =======================================
//		CREATE CONTAINERS
// =======================================

  
//=============== Device Container ==================
	var dev = local.values.addContainer("Receiver");
	//	dev.setCollapsed(true);		
		r=dev.addStringParameter("Model Name", "","");
		r.setAttribute("readonly" ,true);
		r=dev.addStringParameter("Receiver ID", "","");
		r.setAttribute("readonly" ,true);
		r=dev.addStringParameter("MAC Address", "","");
		r.setAttribute("readonly" ,true);
		r=dev.addStringParameter("IP Address", "","");
		r.setAttribute("readonly" ,true);
		r=dev.addStringParameter("RF Band", "","");
		r.setAttribute("readonly" ,true);
		r=dev.addStringParameter("Power Lock", "","");
		r.setAttribute("readonly" ,true);
		r=dev.addStringParameter("Menu Lock", "","");
		r.setAttribute("readonly" ,true);
		r=dev.addStringParameter("FW Version", "","");
		r.setAttribute("readonly" ,true);
		
//============== Channels Container ==================
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
	 var chan = local.values.addContainer("Transmitter");
		chan.setCollapsed(true);	
		chan.addTrigger("Update", "Request all the Values from the Hardware !!" , false);			
		var champs = util.getObjectProperties(contain);
		for (var n = 0; n < champs.length; n++) {
			if (contain[champs[n]][1] == "s") {
			p=chan.addStringParameter(contain[champs[n]][0], "", ""); 
			p.setAttribute("readonly" ,true);}			
			else if (contain[champs[n]][1] == "f1") {
			p=chan.addFloatParameter(contain[champs[n]][0], "", -115,-115,-1); 
			p.setAttribute("readonly" ,true);}			
			else if (contain[champs[n]][1] == "f2") {
			p=chan.addFloatParameter(contain[champs[n]][0], "", -50,-50,-1);
			p.setAttribute("readonly" ,true);}			
			else if (contain[champs[n]][1] == "f3") {
			p=chan.addFloatParameter(contain[champs[n]][0], "", 0,0,100); 
			p.setAttribute("readonly" ,true);} 
			else if (contain[champs[n]][1] == "en") {	
			p=chan.addEnumParameter("Battery Bars", "Battery Bars","unknown","255","5/5 full","5","4/5 bars","4","3/5 bars","3","2/5 bars","2","1/5 bars","1","0/5 alerte !", "0");
			p.setAttribute("readonly" ,true);	}		}
			
	
			
}


// =======================================
//		HELPER
// =======================================

function toInt(input) {
  //function is used to parse strings with leading 0 to int, parseInt assumes a number in octal representation due to the leading 0, so 05000 becomes 2560. with this function 05000 will be parsed as 5000.
  string = input;
  notNull = false;
  res = "";
  for (indx = 0; indx < string.length; indx++) {
    char = string.substring(indx, indx + 1);
    if (char != 0 || notNull) {
      res += char;
      notNull = true;
    }
  }

  return parseInt(res);
}

// =======================================
//		DATA RECEIVED
// =======================================

function dataReceived(inputData) {

  splitData = inputData.split(">");
  for (item = 0; item < splitData.length; item++) {
    data = splitData[item];
    // Removing the surrounding "<" and ">"
    trimmedStr = data.substring(2, data.length - 1);
    // remove possible string answers
    if (trimmedStr.indexOf("{") > -1) {
      string = trimmedStr.substring(
        trimmedStr.indexOf("{"),
        trimmedStr.indexOf("}") + 1
      );
      trimmedStr = trimmedStr.replace(string, "");
      string = string.replace("{", "").replace("}", "");
    }

// ========= Splitting the string by spaces ==========
    parts = trimmedStr.split(" ");

    if (parts[0] == "REP") {
      //message is a return value from the receiver
      //TODO: do something with it
      //script.log(parts[2]);

// =======================================
// 		RECEIVER INFOS 
// =======================================
      
        local.values.receiver.modelName.set(model);
     
      if (parts[1] == "DEVICE_ID") {
        local.values.receiver.receiverID.set(string);
      } 
      if (parts[1] == "MAC_ADDR") {
        local.values.receiver.macAddress.set(parts[2]);
      }
      if (parts[1] == "NET_SETTINGS") {
        local.values.receiver.ipAddress.set(parts[4]);
      }
      if (parts[1] == "FW_VER") {
        local.values.receiver.fwVersion.set(string);
      }
      if (parts[1] == "RF_BAND") {
        local.values.receiver.rfBand.set(string);
      }
      if (parts[1] == "FLASH") {
        if (parts[2] == "ON") {
          local.values.receiver.flashing.set(true);
        } else {
          local.values.receiver.flashing.set(false);
        }
      }
// =======================================
//		TRANSMITTER INFOS 
// =======================================


      if (parts[2] == "CHAN_NAME") {
        local.values.transmitter.getChild("name")
          .set(string);
      } 
      if (parts[2] == "TX_TYPE") {
        local.values.transmitter.getChild("transmitter")
          .set(parts[3]);
      }
      if (parts[2] == "TX_PWR_LOCK") {
        local.values.receiver.powerLock.set(parts[3]);
      }
      if (parts[2] == "TX_MENU_LOCK") {
        local.values.receiver.menuLock.set(parts[3]);
      }
      if (parts[2] == "METER_RATE") {
        local.parameters.feedback.setData(parts[3]);
      }
      if (parts[2] == "GROUP_CHAN") {
      	var grp_chan = parts[3];
        grp_chan =  grp_chan.split(",");
          
        local.values.transmitter.rfGroup.set(grp_chan[0]);
        local.values.transmitter.rfChannel.set(grp_chan[1]);
      }
      if (parts[2] == "AUDIO_GAIN") {
          parts[3] = parts[3].substring(1, parts[3].length);
          var val = parseFloat(parts[3]) - 18 ;
          val = val+" db" ;
        local.values.transmitter.audioGain.set(val);
      }
      if (parts[2] == "TX_OFFSET") {
		var val = parseFloat(parts[3]) ;
		if (val == 255) { val = "NO TRANSMITTER" ;}
		else {val = val+" db" ;}
        local.values.transmitter.gainOffset.set(val);
      }
       if (parts[2] == "TX_MUTE_STATUS") {
        local.values.transmitter.mute.set(parts[3]);
      }
      if (parts[2] == "RX_RF_LVL") {
      var rfparse = parseFloat(parts[3]) -115;
      	if (rfparse > -10) {rf = rfparse+" dBm - OverLoad!";}
         else if (rfparse < -75) {rf = "RF too low !";}
         else {rf = rfparse+" dBm";}
        local.values.transmitter.rf.set(rf);
        local.values.transmitter.rfLevel.set(rfparse);
      }
               
      if (parts[2] == "AUDIO_LVL") {
      var parselvl = parseFloat(parts[3]);
      var level = parselvl - 50 ;
      if (level < -47)
        {var lvlstring = "NO SIGNAL" ;}
      else {lvlstring = level+" dbFS" ;}
     	local.values.transmitter.audio.set(lvlstring);
        local.values.transmitter.audioLevel.set(level);
      }
           
      if (parts[2] == "TX_RF_PWR") {
        local.values.transmitter.rfPower.set(parts[3]);
      }
      
      if (parts[2] == "RF_ANTENNA") {
      	var ant = parts[3];
      	if (ant== "XX" || ant== "" ){ ant = "RF no antenna" ;}
      	if (ant== "AX"){ ant = "antenna A" ;}
      	if (ant== "XB"){ ant = "antenna B" ;}
        local.values.transmitter.antenna.set(ant);
      }
      if (parts[2] == "FREQUENCY") {
        dec = parts[3].substring(parts[3].length - 3, parts[3].length);
        lead = parts[3].substring(0, parts[3].length - 3);
        local.values.transmitter.frequency.set(lead + "." + dec);
         var band = "--" ;
        if(lead >470 && lead< 534){ band = "G51" ;}
        else if(lead >534 && lead< 598){ band = "H51" ;}
        else if(lead >606 && lead< 670){ band = "K51" ;}
        local.values.receiver.rfBand.set(band);
      }
      if (parts[1] == "ENCRYPTION") {
        local.values.transmitter.encryption.set(parts[2]);
      }
       if (parts[2] == "BATT_TYPE") {
        local.values.transmitter.batteryType.set(parts[3]);
      }
      if (parts[2] == "BATT_BARS") {
      var charge = parseFloat(parts[3]) ;
      if ( charge <= 5){ charge = charge*20 ;}
      else {charge = 0 ;}
        local.values.transmitter.batteryBars.setData(parseInt(parts[3]));
        local.values.transmitter.batteryCharge.set(charge);
      }
      if (parts[2] == "BATT_CYCLE") {
      	var cycle = parseInt(parts[3]);
      	 if (cycle == 65535) {
          local.values.transmitter.batteryCycles.set("SHOWN ONLY FOR SB900 !");}
          else
          {local.values.transmitter.batteryCycles.set(""+cycle+"");}
      }
      if (parts[2] == "BATT_RUN_TIME") {
        mins = parseInt(parts[3]);
        if (mins <= 65532) {
          hrs = Math.floor(mins / 60);
          min = mins - hrs * 60;
          lbl = hrs + " hrs " + min + " min";
        } else if (mins == 65533) {
          lbl = "Battery communication warning";
        } else if (mins == 65534) {
          lbl = "Battery time calculating";
        } else if (mins == 65535) {
          lbl = "SHOWN ONLY FOR SB900 !";
        }  
        local.values.transmitter.batteryRuntime.set(lbl);
      }
    } else if (parts[0] == "SAMPLE") {
      if (parts[2] == "ALL") {
      	//A/B Antenna
      	var ant = parts[3];
      	if (ant== "XX" || ant== "" ){ ant = "RF no antenna" ;}
      	if (ant== "AX"){ ant = "antenna A" ;}
      	if (ant== "XB"){ ant = "antenna B" ;}
        local.values.transmitter.antenna.set(ant);
        
         //RF Level
         var rfparse = parseFloat(parts[4]) -115 ;
         if (rfparse >= -10) {rf = rfparse+" dBm - OverLoad!";}
         else if (rfparse < -75) {rf = "RF too low !";}
         else {rf = rfparse+" dBm";}
        local.values.transmitter.rf.set(rf);
        local.values.transmitter.rfLevel.set(rfparse);
        
        //Audio Level Peak
        var parselvl = parseFloat(parts[5]) ;
		var level = parselvl - 50 ;
		if (level < -47)
        {level = "NO SIGNAL" ;}
        else if (level < -47 && level < -6)
        {level = level+" dbFS -> Limit!" ;}
        else if (level >= -6 )
        {level = level+" dbFS -> Clip !!" ;}
        else {level = level+" dbFS" ;}
        var lvlstring = parselvl - 50 ;
        local.values.transmitter.audio.set(level);
        local.values.transmitter.audioLevel.set(lvlstring);
      }
    }
  }
}

// =======================================
// 		PARAM CHANGE
// =======================================

function moduleParameterChanged(param) {

  		if (param.name == "isConnected" && param.get() == 1) {
    	getAll();  }
    	
    	if (param.name == "reset") {
    	local.parameters.feedback.set("no Updates"); }
    	
	  	if (param.name == "feedback"){
	  	setMeterRate(param.get());}
	
}


// =======================================
// 		VALUE CHANGE 
// =======================================

function moduleValueChanged(value) {
	
	if (value.name == "update") {
      local.send("< GET 0 ALL >");
    }
 
}

// =======================================
// 		REQUESTS 
// =======================================

function requestModel() {
  //< GET MODEL >
  local.send("< GET MODEL >");
}

function requestDeviceID() {
  //< GET DEVICE_ID >
  local.send("< GET DEVICE_ID >");
}

function requestRfBand() {
  //< GET RF_BAND >
  local.send("< GET RF_BAND >");
}

function requestFwVersion() {
  local.send("< GET FW_VER >");
}

function requestChName(ch) {
  local.send("< GET 1 CHAN_NAME >");
}

function requestChAGain(ch) {
  local.send("< GET 1 AUDIO_GAIN >");
}

function requestChGroup(ch) {
  local.send("< GET 1 GROUP_CHAN >");
}

function requestChFreq() {
  local.send("< GET 1 FREQUENCY >");
}

function getAll() {
  local.send("< GET 0 ALL >");
}

function requests(string) {
  local.send(string);
}

// =======================================
//  	COMMANDS 
// =======================================

function setDeviceID(newid) {
  local.send("< SET DEVICE_ID {" + newid + "} >");
}

function sendLine(line) {
    local.send(line );
}

function setChannelName(newName) {
    local.send(
      "< SET 1 CHAN_NAME {" +newName+ "} >" );
}

function setAudioGain(gain) {
    local.send("< SET 1 AUDIO_GAIN " + (gain + 18) + " >");
}

function incAudioGain(addgain) {
    local.send("< SET 1 AUDIO_GAIN INC " + addgain + " >");
}

function decAudioGain(addgain) {
	local.send("< SET 1 AUDIO_GAIN DEC " + addgain + " >");
}

function setMeterRate(rate) {
    local.send("< SET 1 METER_RATE " + rate + " >");

}
