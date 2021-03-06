FROM alpine:3.9

# hadolint ignore=DL3018
RUN apk add --no-cache bind-tools ca-certificates mailcap tini

# hadolint ignore=DL3022
COPY --from=ctags /usr/local/bin/universal-* /usr/local/bin/

# hadolint ignore=DL3022
COPY --from=libsqlite3-pcre /sqlite3-pcre/pcre.so /libsqlite3-pcre.so
ENV LIBSQLITE3_PCRE /libsqlite3-pcre.so
# hadolint ignore=DL3018
RUN apk --no-cache add pcre-dev

# universal-ctags doesn't support some popular languages out of the box (Scala,
# Swift, and Haskell, to name a few). However, you can add language support by
# providing regexes on the command line or in a configuration file.
# universal-ctags looks in the current working directory for config files during
# initialization:
# https://github.com/universal-ctags/ctags/blob/1b747b38589f7a1c98ac9fe0a0b8b174dd476050/docs/optlib.rst#preload-option-file
WORKDIR /
COPY .ctags.d /.ctags.d

ENV CACHE_DIR=/mnt/cache/symbols
EXPOSE 3184
ENTRYPOINT ["/sbin/tini", "--", "/usr/local/bin/symbols"]
COPY symbols /usr/local/bin/
