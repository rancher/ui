export default function findComponentInstance(owner, fullName) {
  return Object.values(owner.__container__.lookup('-view-registry:main'))
    .find((instance) => instance._debugContainerKey === fullName);
}