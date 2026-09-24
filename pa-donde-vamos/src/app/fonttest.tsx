import { useFonts } from 'expo-font';
import { PlayfairDisplay_900Black } from '@expo-google-fonts/playfair-display';
import { AbrilFatface_400Regular } from '@expo-google-fonts/abril-fatface';
import { RozhaOne_400Regular } from '@expo-google-fonts/rozha-one';
import { BodoniModa_900Black } from '@expo-google-fonts/bodoni-moda';
import { KaushanScript_400Regular } from '@expo-google-fonts/kaushan-script';
import { Knewave_400Regular } from '@expo-google-fonts/knewave';
import { CaveatBrush_400Regular } from '@expo-google-fonts/caveat-brush';
import { Caveat_700Bold } from '@expo-google-fonts/caveat';
import { ScrollView, Text } from 'react-native';
const H = ['PlayfairDisplay_900Black','AbrilFatface_400Regular','RozhaOne_400Regular','BodoniModa_900Black'];
const S = ['KaushanScript_400Regular','Knewave_400Regular','CaveatBrush_400Regular','Caveat_700Bold'];
export default function T() {
  useFonts({ PlayfairDisplay_900Black, AbrilFatface_400Regular, RozhaOne_400Regular, BodoniModa_900Black, KaushanScript_400Regular, Knewave_400Regular, CaveatBrush_400Regular, Caveat_700Bold });
  return <ScrollView style={{backgroundColor:'#F1EADB'}}>
    {H.map(f=><Text key={f} style={{fontFamily:f,fontSize:44,color:'#141A2B'}}>{"PA' DONDE VAMOS"}<Text style={{fontSize:10}}>{f}</Text></Text>)}
    {S.map(f=><Text key={f} style={{fontFamily:f,fontSize:56,color:'#2B55F0'}}>HOY?<Text style={{fontSize:10}}>{f}</Text></Text>)}
  </ScrollView>;
}
