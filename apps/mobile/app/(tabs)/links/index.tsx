import { useLinks } from "@linkwarden/router/links";
import { View, StyleSheet, FlatList, Platform } from "react-native";
import useAuthStore from "@/store/auth";
import LinkListing from "@/components/LinkListing";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { LinkIncludingShortenedCollectionAndTags } from "@linkwarden/types";
import Spinner from "@/components/ui/Spinner";
import { rawTheme, ThemeName } from "@/lib/colors";
import { useColorScheme } from "nativewind";

const RenderItem = React.memo(
  ({ item }: { item: LinkIncludingShortenedCollectionAndTags }) => {
    return <LinkListing link={item} />;
  }
);

export default function LinksScreen() {
  const { colorScheme } = useColorScheme();
  const { auth } = useAuthStore();
  const { search } = useLocalSearchParams<{ search?: string }>();

  const { links, data } = useLinks(
    {
      sort: 0,
      searchQueryString: decodeURIComponent(search ?? ""),
    },
    auth
  );

  return (
    <View
      style={styles.container}
      className="h-full bg-base-100"
      collapsable={false}
      collapsableChildren={false}
    >
      <FlatList
        contentInsetAdjustmentBehavior="automatic"
        ListHeaderComponent={() => <></>}
        data={links || []}
        refreshControl={
          <Spinner
            refreshing={data.isRefetching}
            onRefresh={() => data.refetch()}
            progressBackgroundColor={
              rawTheme[colorScheme as ThemeName]["base-200"]
            }
            colors={[rawTheme[colorScheme as ThemeName]["base-content"]]}
          />
        }
        refreshing={data.isRefetching}
        initialNumToRender={4}
        keyExtractor={(item) => item.id?.toString() || ""}
        renderItem={({ item }) => (
          <RenderItem item={item} key={item.id?.toString()} />
        )}
        onEndReached={() => data.fetchNextPage()}
        onEndReachedThreshold={0.5}
        ItemSeparatorComponent={() => (
          <View className="bg-neutral-content h-px" />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: Platform.select({
    ios: {
      paddingBottom: 83,
    },
    default: {},
  }),
});
