import { View, FlatList } from "react-native";
import { useLocalSearchParams } from "expo-router";
import Header from "@twikkl/components/Group/Header";
import VideoCard from "@twikkl/components/Group/VideoCard";
import { cardDataGroup, cardDataYou } from "@twikkl/data/discover/cardData";
import { useState } from "react";
import { useThemeMode } from "@twikkl/entities/theme.entity";

export interface IGroup {
  desc: string;
  followers?: number;
  img: any;
  title: string;
  members: string;
  fav?: boolean;
  id: string;
  smallImg: any;
  status: string;
  smallGroup: string[];
  videos: any;
}

const Group = (): JSX.Element => {
  const { id } = useLocalSearchParams();
  const { isDarkMode } = useThemeMode();
  const groups = [...cardDataYou, ...cardDataGroup];
  const groupData = groups.find((item) => item.id === id);
  const [select, setSelect] = useState(0);
  const numColumns = select + 1;

  const backgroundColor = isDarkMode ? "#000" : "#fff";

  return (
    <View style={{ flex: 1, backgroundColor }}>
      <Header select={select} setSelect={setSelect} {...groupData} />
      <View style={{ zIndex: -2, flex: 1 }}>
        <FlatList
          numColumns={numColumns}
          key={numColumns}
          data={groupData?.videos}
          renderItem={({ item }) => {
            return <VideoCard numCol={numColumns} videoLink={item} />;
          }}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item, index) => index.toString()}
        />
      </View>
    </View>
  );
};

export default Group;
