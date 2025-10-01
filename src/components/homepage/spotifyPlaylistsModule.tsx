"use client";

import { type SpotifyPlaylistsModule } from "../../../sanity.types";
import React from "react";
import { useRouter } from "next/navigation";

function SpotifyPlaylistsModuleComponent({
  spotifyPlaylistsModule,
}: {
  spotifyPlaylistsModule: SpotifyPlaylistsModule;
}) {
  const router = useRouter();

  return (
    <div className="ml-2 pr-4 mt-4 w-full">
      <div className="py-4 flex justify-between items-center">
        <h2 className="text-black text-lg font-medium">
          {spotifyPlaylistsModule.title}
        </h2>
        <button
          className="text-black text-sm hover:underline cursor-pointer"
          onClick={() => {
            router.push(spotifyPlaylistsModule.buttonLink || "/playlists");
          }}
        >
          {spotifyPlaylistsModule.buttonText || "View All Playlists"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {spotifyPlaylistsModule.playlists?.map((playlist, index) => (
          <div key={index} className="group">
            <div className="w-full mb-4">
              <iframe
                style={{ borderRadius: "12px" }}
                src={`https://open.spotify.com/embed/playlist/${playlist.playlistId}?utm_source=generator`}
                width="100%"
                height={playlist.height || 352}
                frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                className="shadow-lg"
              />
            </div>

            {(playlist.title || playlist.description) && (
              <div className="space-y-2">
                {playlist.title && (
                  <h3 className="text-xl font-semibold text-black group-hover:underline line-clamp-2">
                    {playlist.title}
                  </h3>
                )}

                {playlist.description && (
                  <p className="text-gray-600 line-clamp-3">
                    {playlist.description}
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default SpotifyPlaylistsModuleComponent;
