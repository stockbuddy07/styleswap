# 🛡️ Guide: Removing Secrets from Git History

If you have accidentally committed a file containing secrets (like `.env`, passwords, or API keys), simply deleting it from your latest commit is **NOT** enough. It still exists in your git history and can be recovered.

## 🚨 Immediate Action
If the leaked secret is a **password**, **API key**, or **token** that is currently active, **REVOKE IT IMMEDIATELY**.
- Change your database password.
- Regenerate your API keys.
- Invalidate your tokens.
*Cleaning git history does not save you if the key was already scraped.*

## Tools for Cleaning History
We recommend using [git-filter-repo](https://github.com/newren/git-filter-repo) (Python-based, modern) or [BFG Repo-Cleaner](https://rtyley.github.io/bfg-repo-cleaner/) (Java-based, simpler).

### Option 1: Using BFG (Easier)
1.  **Download BFG**: [https://rtyley.github.io/bfg-repo-cleaner/](https://rtyley.github.io/bfg-repo-cleaner/)
2.  **Run BFG to delete a file**:
    ```bash
    java -jar bfg.jar --delete-files .env
    ```
3.  **Run BFG to replace text** (e.g., verify "password123" is replaced):
    - Create a file `passwords.txt` with the text you want to remove.
    - Run: `java -jar bfg.jar --replace-text passwords.txt`

### Option 2: Using git filter-branch (Native, slower)
If you don't want to install extra tools, use the built-in (but complex) `git filter-branch`.
*Warning: This can be destructive.*

```bash
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch server/.env" \
  --prune-empty --tag-name-filter cat -- --all
```

## Finalizing Changes
After rewriting history, you must force-push to update the remote repository.
**⚠️ DANGER: This will overwrite the remote history for everyone.**

```bash
git push origin --force --all
```

## Prevention
1.  **Use `.gitignore`**: Ensure `.env` and `config.js` are ignored.
2.  **Use Pre-commit Hooks**: Tools like `husky` or `pre-commit` can scan for secrets before you commit.
3.  **Audit Regularly**: Run `node scripts/audit_secrets.js` periodically.
