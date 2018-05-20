package openidconnect

import (
	"context"
	"fmt"

	oidc "github.com/coreos/go-oidc"
	"github.com/sourcegraph/sourcegraph/cmd/frontend/internal/auth"
	"github.com/sourcegraph/sourcegraph/cmd/frontend/internal/db"
	"github.com/sourcegraph/sourcegraph/pkg/actor"
)

// getOrCreateUser gets or creates a user account based on the OpenID Connect token. It returns the
// authenticated actor if successful; otherwise it returns an friendly error message (safeErrMsg)
// that is safe to display to users, and a non-nil err with lower-level error details.
func getOrCreateUser(ctx context.Context, p *provider, idToken *oidc.IDToken, userInfo *oidc.UserInfo, claims *userClaims) (_ *actor.Actor, safeErrMsg string, err error) {
	login := claims.PreferredUsername
	if login == "" {
		login = userInfo.Email
	}
	email := userInfo.Email
	var displayName = claims.GivenName
	if displayName == "" {
		if claims.Name == "" {
			displayName = claims.Name
		} else {
			displayName = login
		}
	}
	login, err = auth.NormalizeUsername(login)
	if err != nil {
		return nil, fmt.Sprintf("Error normalizing the username %q. See https://about.sourcegraph.com/docs/config/authentication#username-normalization.", login), err
	}

	var data db.ExternalAccountData
	auth.SetExternalAccountData(&data.AccountData, struct {
		IDToken    *oidc.IDToken  `json:"idToken"`
		UserInfo   *oidc.UserInfo `json:"userInfo"`
		UserClaims *userClaims    `json:"userClaims"`
	}{IDToken: idToken, UserInfo: userInfo, UserClaims: claims})

	userID, safeErrMsg, err := auth.CreateOrUpdateUser(ctx, db.NewUser{
		Username:        login,
		Email:           email,
		EmailIsVerified: email != "", // TODO(sqs): https://github.com/sourcegraph/sourcegraph/issues/10118
		DisplayName:     displayName,
		AvatarURL:       claims.Picture,
	}, db.ExternalAccountSpec{
		ServiceType: providerType,
		ServiceID:   idToken.Issuer,
		ClientID:    p.config.ClientID,
		AccountID:   idToken.Subject,
	}, data)
	if err != nil {
		return nil, safeErrMsg, err
	}
	return actor.FromUser(userID), "", nil
}